// import * as THREE from 'three'
// import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
// require('./lib/three_r70.min.js')
import THREE from './lib/three_r70.min.js'
require('./lib/myFirstPersonControls2.js')

class Common {
  constructor() {
    this.scene = null
    this.camera = null
    this.controls = null
    this.renderer = null

    this.size = {
      windowW: null,
      windowH: null,
    }

    this.clock = null

    this.time = {
      total: null,
      delta: null,
    }
  }

  init($canvas) {
    this.setSize()

    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({
      canvas: $canvas,
    })

    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.renderer.setClearColor(0x333333, 1.0)
    this.renderer.setSize(this.size.windowW, this.size.windowH)

    this.clock = new THREE.Clock()
    this.clock.start()

    // setup camera
    // カメラを作成
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.size.windowW / this.size.windowH,
    )
    // this.camera.position.set(0, 0, +1000)
    this.camera.up.set(0, 1, 0)
    this.controls = new THREE.FirstPersonControls(this.camera, $canvas);
    this.controls.movementSpeed = 10
    this.controls.lookSpeed = 0.2

    // setup light
    const ambientLight = new THREE.AmbientLight('0xffffff')
    this.scene.add(ambientLight)
  }

  setSize() {
    this.size = {
      windowW: window.innerWidth,
      windowH: window.innerHeight,
    }
  }

  resize() {
    this.setSize()
    this.camera.aspect = this.size.windowW / this.size.windowH
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.size.windowW, this.size.windowH)
  }

  render() {
    this.time.delta = this.clock.getDelta()
    this.time.total += this.time.delta
    this.controls.update(this.time.delta)
    this.renderer.clear();

    this.renderer.render(this.scene, this.camera)
  }
}

export default new Common()
