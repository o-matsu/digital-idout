/**
 * Custom FirstPersonControls for digital-idout
 *
 * Based on Three.js FirstPersonControls with custom modifications:
 * - Drag-based view movement (not mouse position based)
 * - Click detection when drag distance is short
 * - Integration with mitt event bus for MOUSE_CLICK events
 * - Right-click PAN, middle-click DOLLY
 * - Q key to toggle freeze
 */

import * as THREE from 'three'
import { eventBus } from '~/composables/useEventBus'

const STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2 }

class CustomFirstPersonControls {
  constructor(camera, domElement) {
    this.object = camera
    this.domElement = domElement

    // Settings
    this.movementSpeed = 1.0
    this.lookSpeed = 100.0
    this.rotateSpeed = 50
    this.panSpeed = 1.0
    this.zoomSpeed = 0.5

    this.lookVertical = true
    this.autoForward = false
    this.activeLook = true

    this.heightSpeed = false
    this.heightCoef = 1.0
    this.heightMin = 0.0
    this.heightMax = 1.0

    this.constrainVertical = false
    this.verticalMin = 0
    this.verticalMax = Math.PI

    // Orbit-style limits
    this.minPolarAngle = 0
    this.maxPolarAngle = Math.PI
    this.minAzimuthAngle = -Infinity
    this.maxAzimuthAngle = Infinity
    this.minDistance = 0
    this.maxDistance = Infinity

    // State
    this.enabled = true
    this.freeze = false
    this.mouseDragOn = false

    // Internal state
    this._state = STATE.NONE
    this._dragDistance = 0

    this._mouseX = 0
    this._mouseY = 0
    this._prevMouseX = 0
    this._prevMouseY = 0

    this._viewHalfX = 0
    this._viewHalfY = 0

    this._lat = 0
    this._lon = 0

    this._moveForward = false
    this._moveBackward = false
    this._moveLeft = false
    this._moveRight = false
    this._moveUp = false
    this._moveDown = false

    // Pan and dolly
    this._panStart = new THREE.Vector2()
    this._panEnd = new THREE.Vector2()
    this._panDelta = new THREE.Vector2()
    this._panOffset = new THREE.Vector3()
    this._pan = new THREE.Vector3()

    this._dollyStart = new THREE.Vector2()
    this._dollyEnd = new THREE.Vector2()
    this._dollyDelta = new THREE.Vector2()
    this._scale = 1

    this._target = new THREE.Vector3(0, 0, 0)

    // For orbit-style calculations
    this._quat = new THREE.Quaternion().setFromUnitVectors(
      this.object.up,
      new THREE.Vector3(0, 1, 0)
    )
    this._quatInverse = this._quat.clone().invert()
    this._offset = new THREE.Vector3()

    // Bind event handlers
    this._onMouseDown = this._handleMouseDown.bind(this)
    this._onMouseUp = this._handleMouseUp.bind(this)
    this._onMouseMove = this._handleMouseMove.bind(this)
    this._onMouseOut = this._handleMouseOut.bind(this)
    this._onMouseWheel = this._handleMouseWheel.bind(this)
    this._onKeyDown = this._handleKeyDown.bind(this)
    this._onKeyUp = this._handleKeyUp.bind(this)
    this._onContextMenu = this._handleContextMenu.bind(this)

    // Connect
    this._connect()
    this.handleResize()
  }

  _connect() {
    this.domElement.addEventListener('mousedown', this._onMouseDown, false)
    this.domElement.addEventListener('mouseup', this._onMouseUp, false)
    this.domElement.addEventListener('mousemove', this._onMouseMove, false)
    this.domElement.addEventListener('mouseout', this._onMouseOut, false)
    this.domElement.addEventListener('wheel', this._onMouseWheel, false)
    this.domElement.addEventListener('contextmenu', this._onContextMenu, false)
    window.addEventListener('keydown', this._onKeyDown, false)
    window.addEventListener('keyup', this._onKeyUp, false)

    this.domElement.setAttribute('tabindex', -1)
  }

  dispose() {
    this.domElement.removeEventListener('mousedown', this._onMouseDown)
    this.domElement.removeEventListener('mouseup', this._onMouseUp)
    this.domElement.removeEventListener('mousemove', this._onMouseMove)
    this.domElement.removeEventListener('mouseout', this._onMouseOut)
    this.domElement.removeEventListener('wheel', this._onMouseWheel)
    this.domElement.removeEventListener('contextmenu', this._onContextMenu)
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
  }

  handleResize() {
    if (this.domElement === document) {
      this._viewHalfX = window.innerWidth / 2
      this._viewHalfY = window.innerHeight / 2
    } else {
      this._viewHalfX = this.domElement.offsetWidth / 2
      this._viewHalfY = this.domElement.offsetHeight / 2
    }
  }

  // Mouse event handlers
  _handleMouseDown(event) {
    this._dragDistance = 0

    if (event.button === 0) {
      // Left click - rotate
      this._state = STATE.ROTATE
      this._prevMouseX = event.pageX - this.domElement.offsetLeft - this._viewHalfX
      this._prevMouseY = event.pageY - this.domElement.offsetTop - this._viewHalfY
    } else if (event.button === 1) {
      // Middle click - dolly
      this._state = STATE.DOLLY
      this._dollyStart.set(event.clientX, event.clientY)
    } else if (event.button === 2) {
      // Right click - pan
      this._state = STATE.PAN
      this._panStart.set(event.clientX, event.clientY)
    }

    this.mouseDragOn = true
  }

  _handleMouseUp(event) {
    // If drag distance is small, treat as click
    if (this._dragDistance < 10 && this._state === STATE.ROTATE) {
      eventBus.emit('MOUSE_CLICK', event)
    }

    this._mouseX = 0
    this._mouseY = 0
    this._state = STATE.NONE
    this.mouseDragOn = false
  }

  _handleMouseMove(event) {
    if (!this.mouseDragOn) return

    if (this._state === STATE.ROTATE) {
      this._dragDistance++

      const currentX = event.pageX - this.domElement.offsetLeft - this._viewHalfX
      const currentY = event.pageY - this.domElement.offsetTop - this._viewHalfY

      this._mouseX = (this._prevMouseX - currentX) * this.rotateSpeed
      this._mouseY = (this._prevMouseY - currentY) * this.rotateSpeed

      this._prevMouseX = currentX
      this._prevMouseY = currentY
    } else if (this._state === STATE.DOLLY) {
      this._dollyEnd.set(event.clientX, event.clientY)
      this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart)

      if (this._dollyDelta.y > 0) {
        this._dollyIn()
      } else {
        this._dollyOut()
      }

      this._dollyStart.copy(this._dollyEnd)
    } else if (this._state === STATE.PAN) {
      this._panEnd.set(event.clientX, event.clientY)
      this._panDelta.subVectors(this._panEnd, this._panStart)

      this._doPan(this._panDelta.x, this._panDelta.y)

      this._panStart.copy(this._panEnd)
    }
  }

  _handleMouseOut() {
    this._mouseX = 0
    this._mouseY = 0
    this.mouseDragOn = false
  }

  _handleMouseWheel(event) {
    if (event.deltaY > 0) {
      this._dollyIn()
    } else {
      this._dollyOut()
    }
  }

  _handleContextMenu(event) {
    event.preventDefault()
  }

  // Keyboard event handlers
  _handleKeyDown(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this._moveForward = true
        break
      case 'ArrowLeft':
      case 'KeyA':
        this._moveLeft = true
        break
      case 'ArrowDown':
      case 'KeyS':
        this._moveBackward = true
        break
      case 'ArrowRight':
      case 'KeyD':
        this._moveRight = true
        break
      case 'KeyR':
        this._moveUp = true
        break
      case 'KeyF':
        this._moveDown = true
        break
      case 'KeyQ':
        this.freeze = !this.freeze
        break
    }
  }

  _handleKeyUp(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this._moveForward = false
        break
      case 'ArrowLeft':
      case 'KeyA':
        this._moveLeft = false
        break
      case 'ArrowDown':
      case 'KeyS':
        this._moveBackward = false
        break
      case 'ArrowRight':
      case 'KeyD':
        this._moveRight = false
        break
      case 'KeyR':
        this._moveUp = false
        break
      case 'KeyF':
        this._moveDown = false
        break
    }
  }

  // Dolly helpers
  _getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed)
  }

  _dollyIn(dollyScale) {
    if (dollyScale === undefined) {
      dollyScale = this._getZoomScale()
    }
    this._scale /= dollyScale
  }

  _dollyOut(dollyScale) {
    if (dollyScale === undefined) {
      dollyScale = this._getZoomScale()
    }
    this._scale *= dollyScale
  }

  // Pan helpers
  _panLeft(distance) {
    const te = this.object.matrix.elements
    this._panOffset.set(te[0], te[1], te[2])
    this._panOffset.multiplyScalar(-distance * this.panSpeed)
    this._pan.add(this._panOffset)
  }

  _panUp(distance) {
    const te = this.object.matrix.elements
    this._panOffset.set(te[4], te[5], te[6])
    this._panOffset.multiplyScalar(distance * this.panSpeed)
    this._pan.add(this._panOffset)
  }

  _doPan(deltaX, deltaY) {
    const element = this.domElement

    if (this.object.fov !== undefined) {
      // Perspective camera
      const position = this.object.position
      const offset = position.clone().sub(this._target)
      let targetDistance = offset.length()
      targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0)

      this._panLeft(2 * deltaX * targetDistance / element.clientHeight)
      this._panUp(2 * deltaY * targetDistance / element.clientHeight)
    } else if (this.object.top !== undefined) {
      // Orthographic camera
      this._panLeft(deltaX * (this.object.right - this.object.left) / element.clientWidth)
      this._panUp(deltaY * (this.object.top - this.object.bottom) / element.clientHeight)
    }
  }

  // Main update function
  update(delta) {
    if (!this.enabled || this.freeze) return

    // Height-based speed adjustment
    let autoSpeedFactor = 0.0
    if (this.heightSpeed) {
      const y = THREE.MathUtils.clamp(this.object.position.y, this.heightMin, this.heightMax)
      const heightDelta = y - this.heightMin
      autoSpeedFactor = delta * (heightDelta * this.heightCoef)
    }

    // Movement
    const actualMoveSpeed = delta * this.movementSpeed

    if (this._moveForward || (this.autoForward && !this._moveBackward)) {
      this.object.translateZ(-(actualMoveSpeed + autoSpeedFactor))
    }
    if (this._moveBackward) {
      this.object.translateZ(actualMoveSpeed)
    }
    if (this._moveLeft) {
      this.object.translateX(-actualMoveSpeed)
    }
    if (this._moveRight) {
      this.object.translateX(actualMoveSpeed)
    }
    if (this._moveUp) {
      this.object.translateY(actualMoveSpeed)
    }
    if (this._moveDown) {
      this.object.translateY(-actualMoveSpeed)
    }

    // Look around
    let actualLookSpeed = delta * this.lookSpeed
    if (!this.activeLook) {
      actualLookSpeed = 0
    }

    let verticalLookRatio = 1
    if (this.constrainVertical) {
      verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin)
    }

    this._lon += this._mouseX * actualLookSpeed
    if (this.lookVertical) {
      this._lat -= this._mouseY * actualLookSpeed * verticalLookRatio
    }

    this._lat = Math.max(-85, Math.min(85, this._lat))
    let phi = THREE.MathUtils.degToRad(90 - this._lat)
    const theta = THREE.MathUtils.degToRad(this._lon)

    if (this.constrainVertical) {
      phi = THREE.MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax)
    }

    const targetPosition = this._target
    const position = this.object.position

    targetPosition.x = position.x + 100 * Math.sin(phi) * Math.cos(theta)
    targetPosition.y = position.y + 100 * Math.cos(phi)
    targetPosition.z = position.z + 100 * Math.sin(phi) * Math.sin(theta)

    this.object.lookAt(targetPosition)

    // Apply pan and dolly (orbit-style)
    this._offset.copy(position).sub(this._target)
    this._offset.applyQuaternion(this._quat)

    let orbitTheta = Math.atan2(this._offset.x, this._offset.z)
    let orbitPhi = Math.atan2(
      Math.sqrt(this._offset.x * this._offset.x + this._offset.z * this._offset.z),
      this._offset.y
    )

    orbitTheta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, orbitTheta))
    orbitPhi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, orbitPhi))
    orbitPhi = Math.max(0.000001, Math.min(Math.PI - 0.000001, orbitPhi))

    let radius = this._offset.length() * this._scale
    radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius))

    this._target.add(this._pan)

    this._offset.x = radius * Math.sin(orbitPhi) * Math.sin(orbitTheta)
    this._offset.y = radius * Math.cos(orbitPhi)
    this._offset.z = radius * Math.sin(orbitPhi) * Math.cos(orbitTheta)

    this._offset.applyQuaternion(this._quatInverse)

    position.copy(this._target).add(this._offset)
    this.object.lookAt(this._target)

    // Reset deltas
    this._scale = 1
    this._pan.set(0, 0, 0)
    this._mouseX = 0
    this._mouseY = 0
  }
}

export { CustomFirstPersonControls }
