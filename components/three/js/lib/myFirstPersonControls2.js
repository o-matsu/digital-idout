/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

/*
 * @edit
 * 	ドラッグで視点移動に改良
 * 	ドラッグの距離が短い場合はクリックと判定する
 *
 */
import THREE from './three_r70.min.js'
import EventBus from '~/utils/EventBus'

THREE.FirstPersonControls = function(object, domElement) {

	/////////////////////////////////////////
	this.rotateSpeed = 50;
	var dragdis = 0;

	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };
	var state = STATE.NONE;

	var thetaDelta = 0;
	var phiDelta = 0;

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();
	var panOffset = new THREE.Vector3();
	var pan = new THREE.Vector3();
	this.panSpeed = 1.0;

	var offset = new THREE.Vector3();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();
	var scale = 1;
	this.zoomSpeed = 0.5;

	var scope = this;

	var EPS = 0.000001;

	// so camera.up is the orbit axis
	var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
	var quatInverse = quat.clone().inverse();
	var theta;
	var phi;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Limits to how far you can dolly in and out
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start'};
	var endEvent = { type: 'end'};


	/////////////////////////////////////////

	this.object = object;
	this.target = new THREE.Vector3(0, 0, 0);

	this.domElement = (domElement !== undefined ) ? domElement : document;

	this.movementSpeed = 1.0;
	this.lookSpeed = 100.0;

	this.lookVertical = true;
	this.autoForward = false;
	// this.invertVertical = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;
	this._mouseX = 0;
	this._mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if (this.domElement !== document) {

		this.domElement.setAttribute('tabindex', -1);

	}

	// // // // // // // // // // //
	this.dollyIn = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale /= dollyScale;

	};

	this.dollyOut = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale *= dollyScale;

	};

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	// * * *
	//
	// pass in distance in world space to move left
	this.panLeft = function ( distance ) {

		var te = this.object.matrix.elements;

		// get X column of matrix
		panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
		panOffset.multiplyScalar( - distance  * scope.panSpeed);

		pan.add( panOffset );

	};

	// pass in distance in world space to move up
	this.panUp = function ( distance ) {

		var te = this.object.matrix.elements;

		// get Y column of matrix
		panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
		panOffset.multiplyScalar( distance * scope.panSpeed );

		pan.add( panOffset );

	};

	// pass in x,y of change desired in pixel space,
	// right and down are positive
	this.pan = function ( deltaX, deltaY ) {

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( scope.object.fov !== undefined ) {

			// perspective
			var position = scope.object.position;
			var offset = position.clone().sub( scope.target );
			var targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
			scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

		} else if ( scope.object.top !== undefined ) {

			// orthographic
			scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
			scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

		} else {

			// camera neither orthographic or perspective
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

		}

	};



	// // // // // // // // // // // //
	//
	this.handleResize = function() {

		if (this.domElement === document) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	function onMouseWheel( event ) {
		// event.preventDefault();
		// event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.dollyOut();

		} else {

			scope.dollyIn();

		}

		// scope.update();
		// scope.dispatchEvent( startEvent );
		// scope.dispatchEvent( endEvent );

	}
	this.onMouseDown = function(event) {
		dragdis = 0;

		if (event.button == 0){
			state = STATE.ROTATE;
			this._mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this._mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
		}else if(event.button == 1){
			state = STATE.DOLLY;
			dollyStart.set( event.clientX, event.clientY );
		}else if(event.button == 2){
			state = STATE.PAN;
			panStart.set( event.clientX, event.clientY );
		}

		this.mouseDragOn = true;

	};

	this.onMouseUp = function(event) {
		// console.log(dragdis);
		// if(dragdis < 10 && state == STATE.ROTATE) mouseClick(event);
		if(dragdis < 10 && state == STATE.ROTATE) EventBus.$emit("MOUSE_CLICK", event)

		this.mouseX = 0;
		this.mouseY = 0;
		state = STATE.NONE;
		this.mouseDragOn = false;

	};

	this.onMouseMove = function(event) {
		if (this.mouseDragOn) {
			if (state == STATE.ROTATE){
				dragdis++;

				this.mouseX = (this._mouseX - (event.pageX - this.domElement.offsetLeft - this.viewHalfX)) * scope.rotateSpeed;
				this.mouseY = (this._mouseY - (event.pageY - this.domElement.offsetTop - this.viewHalfY)) * scope.rotateSpeed;

				this._mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
				this._mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
			} else if(state == STATE.DOLLY){
				dollyEnd.set( event.clientX, event.clientY );
				dollyDelta.subVectors( dollyEnd, dollyStart );

				if ( dollyDelta.y > 0 ) {

					scope.dollyIn();

				} else {

					scope.dollyOut();

				}

				dollyStart.copy( dollyEnd );
			} else if(state == STATE.PAN){
				panEnd.set( event.clientX, event.clientY );
				panDelta.subVectors( panEnd, panStart );

				scope.pan( panDelta.x, panDelta.y );

				panStart.copy( panEnd );
			}
		}
	};

	this.onMouseOut = function(event) {
		this.mouseX = 0;
		this.mouseY = 0;
		this.mouseDragOn = false;
	};

	this.onKeyDown = function(event) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38:
			/*up*/
			case 87:
				/*W*/
				this.moveForward = true;
				break;

			case 37:
			/*left*/
			case 65:
				/*A*/
				this.moveLeft = true;
				break;

			case 40:
			/*down*/
			case 83:
				/*S*/
				this.moveBackward = true;
				break;

			case 39:
			/*right*/
			case 68:
				/*D*/
				this.moveRight = true;
				break;

			case 82:
				/*R*/
				this.moveUp = true;
				break;
			case 70:
				/*F*/
				this.moveDown = true;
				break;

			case 81:
				/*Q*/
				this.freeze = !this.freeze;
				break;

		}

	};

	this.onKeyUp = function(event) {

		switch( event.keyCode ) {

			case 38:
			/*up*/
			case 87:
				/*W*/
				this.moveForward = false;
				break;

			case 37:
			/*left*/
			case 65:
				/*A*/
				this.moveLeft = false;
				break;

			case 40:
			/*down*/
			case 83:
				/*S*/
				this.moveBackward = false;
				break;

			case 39:
			/*right*/
			case 68:
				/*D*/
				this.moveRight = false;
				break;

			case 82:
				/*R*/
				this.moveUp = false;
				break;
			case 70:
				/*F*/
				this.moveDown = false;
				break;

		}

	};

	this.update = function(delta) {

		if (this.freeze) {

			return;

		}

		if (this.heightSpeed) {

			var y = THREE.Math.clamp(this.object.position.y, this.heightMin, this.heightMax);
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * (heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;

		if (this.moveForward || (this.autoForward && !this.moveBackward ))
			this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor ));
		if (this.moveBackward)
			this.object.translateZ(actualMoveSpeed);

		if (this.moveLeft)
			this.object.translateX(-actualMoveSpeed);
		if (this.moveRight)
			this.object.translateX(actualMoveSpeed);

		if (this.moveUp)
			this.object.translateY(actualMoveSpeed);
		if (this.moveDown)
			this.object.translateY(-actualMoveSpeed);

		var actualLookSpeed = delta * this.lookSpeed;

		if (!this.activeLook) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if (this.constrainVertical) {

			verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		if (this.lookVertical)
			this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max(-85, Math.min(85, this.lat));
		this.phi = THREE.Math.degToRad(90 - this.lat);

		this.theta = THREE.Math.degToRad(this.lon);

		if (this.constrainVertical) {

			this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);

		}

		var targetPosition = this.target, position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
		targetPosition.y = position.y + 100 * Math.cos(this.phi);
		targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);

		this.object.lookAt(targetPosition);

		// ------------------------------------------------------------------------ //
		var position = this.object.position;

		offset.copy( position ).sub( this.target );

		// rotate offset to "y-axis-is-up" space
		offset.applyQuaternion( quat );

		// angle from z-axis around y-axis

		theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );


		theta += thetaDelta;
		phi += phiDelta;

		// restrict theta to be between desired limits
		theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		// move target to panned location
		this.target.add( pan );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion( quatInverse );

		position.copy( this.target ).add( offset );

		this.object.lookAt( this.target );

		// if(this.mouseX != 0 || this.mouseY != 0 || thetaDelta != 0 || phiDelta != 0 || scale != 1 || pan.x != 0 || pan.y != 0 || pan.z != 0)
			// requestAnimationFrame(draw);


		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set( 0, 0, 0 );


		/////////////////////////////////////////////////////////////////////
		this.mouseX = this.mouseY = 0;
		/////////////////////////////////////////////////////////////////////
	};

	this.domElement.addEventListener('contextmenu', function(event) {
		event.preventDefault();
	}, false);

	this.domElement.addEventListener('mousemove', bind(this, this.onMouseMove), false);
	this.domElement.addEventListener('mousedown', bind(this, this.onMouseDown), false);
	this.domElement.addEventListener('mouseup', bind(this, this.onMouseUp), false);
	this.domElement.addEventListener('keydown', bind(this, this.onKeyDown), false);
	this.domElement.addEventListener('keyup', bind(this, this.onKeyUp), false);

	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );

	this.domElement.addEventListener('mouseout', bind(this, this.onMouseOut), false);

	function bind(scope, fn) {

		return function() {

			fn.apply(scope, arguments);

		};

	};

	this.handleResize();

};
