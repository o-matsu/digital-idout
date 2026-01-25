// import Common from './Common'
// import Shape from './Shape'
import * as THREE from 'three'
import { eventBus } from '~/composables/useEventBus'
import { CustomFirstPersonControls } from './controls/CustomFirstPersonControls.js'
import { LegacyJSONLoader } from './loaders/LegacyJSONLoader.js'

let renderer
let scene
let camera
let controls
let targets = []
let regionsViewFlag = false
let pickingMode = false // false: 通常モード, true: ROI作成
let count = 0, point0_state = -1
let _point
let _pointArray = [], pointArray = [], lineArray = []

const mastaba = []
const polyArray = []
const clock = new THREE.Clock()
const textureLoader = new THREE.TextureLoader()
const discTexture = textureLoader.load('/img/disc.png')
const offset = 0.5


// three.jsの処理を書いていく
export default class ThreeBrain {
  constructor(props) {
    this.props = props
    this.init()
    //
    eventBus.on("DRAW_REGIONS", this.drawRegions.bind(this));
    eventBus.on("TOGGLE_REGIONS_VIEW", this.toggleRegionsView.bind(this));
    eventBus.on("MOUSE_CLICK", this.mouseClick.bind(this));
    eventBus.on("TOGGLE_PICKING_MODE", this.togglePickingMode.bind(this));
  }

  init() {
    this.initThree(this.props.$canvas)
    this.initCamera(this.props.$canvas)
    this.initLight()
    this.initObject()
    this.draw()
    // Common.init(this.props.$canvas)
    // this.shape = new Shape()
    window.addEventListener('resize', this.resize.bind(this))
    // this.loop()
  }

  initThree($canvas) {
    this.$canvas = $canvas
    renderer = new THREE.WebGLRenderer({
      canvas: $canvas,
    })
    if (!renderer) alert('初期化失敗')
    const { width, height } = this.getContainerSize()
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 1.0)
    scene = new THREE.Scene()

    // ポインターイベント（マウス・タッチ両対応）
    renderer.domElement.addEventListener('pointermove', this.pointerMove.bind(this), false);
  }

  getContainerSize() {
    const container = this.$canvas.parentElement
    return {
      width: container ? container.clientWidth : window.innerWidth,
      height: container ? container.clientHeight : window.innerHeight
    }
  }

  initCamera($canvas) {
    const { width, height } = this.getContainerSize()
    camera = new THREE.PerspectiveCamera(
      50,
      width / height,
      1,
      400,
    )
    camera.up.set(0, 1, 0)

    controls = new CustomFirstPersonControls(camera, $canvas)
    controls.movementSpeed = 10
    controls.lookSpeed = 0.2
  }

  initLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0)
    scene.add(ambientLight)
  }

  initObject() {
    // Helper function to load texture with correct color space
    const loadTexture = (path) => {
      const texture = textureLoader.load(path)
      texture.colorSpace = THREE.SRGBColorSpace
      return texture
    }

    // load Scan model
    const loader = new LegacyJSONLoader()
    loader.load(
      '/models/north_tex.json',
      (geometry, materials) => {
        const material = new THREE.MeshPhongMaterial({
          map: loadTexture('/models/north_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[0] = mesh
        scene.add(mastaba[0])
      }
    )
    loader.load(
      '/models/east_tex.json',
      (geometry, materials) => {
        const material = new THREE.MeshPhongMaterial({
          map: loadTexture('/models/east_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[1] = mesh
        scene.add(mastaba[1])
      }
    )
    loader.load(
      '/models/ceiling_tex.json',
      (geometry, materials) => {
        const material = new THREE.MeshPhongMaterial({
          map: loadTexture('/models/ceiling_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[2] = mesh
        scene.add(mastaba[2])
      }
    )
    loader.load(
      '/models/south_tex.json',
      (geometry, materials) => {
        const material = new THREE.MeshPhongMaterial({
          map: loadTexture('/models/south_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[3] = mesh
        scene.add(mastaba[3])
      }
    )
    loader.load(
      '/models/west_tex.json',
      (geometry, materials) => {
        const material = new THREE.MeshPhongMaterial({
          map: loadTexture('/models/west_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[4] = mesh
        scene.add(mastaba[4])
      }
    )
    // 床
    loader.load(
      '/models/floor.json',
      (geometry, materials) => {
        const material = new THREE.MeshPhongMaterial({
          wireframe: true,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        scene.add(mesh)
      }
    )
  }

  // drawRegions(_json, mmode) {
  drawRegions(regions) {
    // 既存の領域をクリア
    polyArray.forEach(poly => {
      if (poly.parent) {
        scene.remove(poly.parent) // lineを削除（meshはlineの子なので一緒に削除される）
      }
    })
    polyArray.length = 0 // 配列をクリア

    const edgeArray = []
    const localOffset = 0.5
    regions.forEach(region => {
      // Create line geometry using BufferGeometry
      const vertices = region.data.points.map(point => {
        return new THREE.Vector3(point.x, point.y, point.z)
      })

      // Create positions array for line (closed loop)
      const linePositions = []
      vertices.forEach(v => {
        linePositions.push(v.x, v.y, v.z)
      })
      // Close the loop
      linePositions.push(vertices[0].x, vertices[0].y, vertices[0].z)

      const lineGeometry = new THREE.BufferGeometry()
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))

      const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
        color : 0xff0000,
        opacity : 0.5,
        linewidth : 10,
        visible : false
      }))
      line.name = region.id
      edgeArray.push(line)
      scene.add(line)

      // Create mesh geometry for the polygon
      const meshPositions = []
      const meshIndices = []

      // Add all vertices
      vertices.forEach(v => {
        meshPositions.push(v.x, v.y, v.z)
      })

      // Create triangle fan indices (0, 1, 2), (0, 2, 3), (0, 3, 4), ...
      for (let j = 0; j < vertices.length - 2; j++) {
        meshIndices.push(0, j + 1, j + 2)
      }

      const meshGeometry = new THREE.BufferGeometry()
      meshGeometry.setAttribute('position', new THREE.Float32BufferAttribute(meshPositions, 3))
      meshGeometry.setIndex(meshIndices)
      meshGeometry.computeVertexNormals()

      const mesh = new THREE.Mesh(meshGeometry, new THREE.MeshBasicMaterial({
        color : 0xffddaa,
        transparent : true,
        opacity : 0.2,
        visible : false
      }))
      polyArray.push(mesh)

      // Get face normal from computed normals
      const normalAttribute = meshGeometry.getAttribute('normal')
      const normal = new THREE.Vector3(
        normalAttribute.getX(0),
        normalAttribute.getY(0),
        normalAttribute.getZ(0)
      )

      // 法線方向へoffsetだけずらす
      line.position.set(
        line.position.x + localOffset * normal.x,
        line.position.y + localOffset * normal.y,
        line.position.z + localOffset * normal.z
      )
      mesh.name = region.id
      line.add(mesh);
    })

    console.log(scene)
  }

  draw() {
    renderer.clear()
    renderer.render(scene, camera)
    controls.update(clock.getDelta())
    requestAnimationFrame(this.draw.bind(this))
  }

  resize() {
    const { width, height } = this.getContainerSize()
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    controls.handleResize()
  }

  pointerMove(e) {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const { width, height } = this.getContainerSize()

    // タッチイベントの場合はスクロール防止
    if (e.pointerType === 'touch') {
      e.preventDefault()
    }

    mouse.x = ( e.clientX / width ) * 2 - 1
    mouse.y = - ( e.clientY / height ) * 2 + 1
    const vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(camera)
    raycaster.set( camera.position, vector.sub( camera.position ).normalize())

    // 領域追加モード：ピッキング対象をモデルに
    // その他のモード：ピッキング対象を領域に
    const intersects = raycaster.intersectObjects(pickingMode ? mastaba : polyArray, true)

    if (pickingMode) {
      if (intersects.length) {
        targets = intersects;
        if(targets[0].object.name == "point0" && count > 2 && point0_state < 0){
          point0_state *= -1;
          targets[0].object.material.size = 5.0;

        }else if(targets[0].object.name != "point0" && point0_state > 0){
          point0_state *= -1;
          _pointArray[0].material.size = 3.0;
        }
      } else if (!intersects.length) {
        targets = []
      }
    } else {
      if (intersects.length > 0) {
        if (!targets.length) {
          targets = intersects
          console.log(targets[0])
          this.showTargets(targets)
        } else if ((intersects.length !== targets.length || intersects[0].object.name !== targets[0].object.name) && targets[0].object.name !== "point0") {
          this.hideTargets(targets)
          targets = intersects
          this.showTargets(targets)
        }
      } else if (targets.length) {
        if (targets[0].object.name !== "point0") {
          this.hideTargets(targets)
          targets = []
        }
      }
    }
    renderer.render(scene, camera);
  }

  mouseClick(e) {
    // タップ/クリック位置で新たにレイキャストを実行
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const { width, height } = this.getContainerSize()

    mouse.x = (e.clientX / width) * 2 - 1
    mouse.y = -(e.clientY / height) * 2 + 1
    const vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(camera)
    raycaster.set(camera.position, vector.sub(camera.position).normalize())

    const intersects = raycaster.intersectObjects(pickingMode ? mastaba : polyArray, true)

    if (intersects.length > 0) {
      targets = intersects
      if (pickingMode) {
        this.createRegion()
      } else if (targets[0].object.name !== "point0") {
        eventBus.emit("PICK_REGIONS", targets)
      }
    }
  }

  showTargets(targets) {
    if (!regionsViewFlag) {
      targets.forEach(target => {
        target.object.material.visible = true
        target.object.parent.material.visible = true
        target.object.parent.material.color.setHex(0xff0000)
      })
    }else{
      targets.forEach(target => {
        target.object.parent.material.color.setHex(0xff0000)
      })
    }
  }

  hideTargets(targets) {
    if (!regionsViewFlag) {
      targets.forEach(target => {
        target.object.material.visible = false
        target.object.parent.material.visible = false
      })
    } else {
      targets.forEach(target => {
        target.object.parent.material.color.setHex(0x0000ff);
      })
    }
  }

  toggleRegionsView(flag) {
    regionsViewFlag = flag
		if (regionsViewFlag) {
      // まず全てのRegionを青色（未選択）で表示
      polyArray.forEach(poly => {
				poly.material.visible = true
				poly.parent.material.visible = true
        poly.parent.material.color.setHex(0x0000ff)
      })
      // 選択中のターゲットがあれば赤色にする
			if (targets.length){
				this.showTargets(targets)
			}
		}
		else {
      polyArray.forEach(poly => {
				poly.material.visible = false
				poly.parent.material.visible = false
      })
			if (targets.length) {
        targets.forEach(target => {
          target.object.parent.material.color.setHex(0xff0000)
        })
				this.showTargets(targets)
			}
		}
  }

  togglePickingMode(flag) {
    pickingMode = flag
    this.resetCreateTarget()
  }

  createRegion() {
    // ピッキング成功 & 入力受付中（処理中でない）
    console.log(targets)
    if (targets.length) {
      // 最初の点が選ばれた時　－　初期化
      if(count == 0){
        _pointArray = new Array();
        pointArray = new Array();
        lineArray = new Array();
      }
      // 再び最初の点が選ばれた時　－　終了
      if(targets[0].object.name == "point0" && count > 2 && point0_state > 0){
        // 線を描く using BufferGeometry
        const positions = [
          _pointArray[count - 1].position.x,
          _pointArray[count - 1].position.y,
          _pointArray[count - 1].position.z,
          _pointArray[0].position.x,
          _pointArray[0].position.y,
          _pointArray[0].position.z
        ]
        const lg = new THREE.BufferGeometry()
        lg.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        lineArray[count] = new THREE.Line(lg, new THREE.LineBasicMaterial({
          color : 0xff0000,
          opacity : 0.5,
          linewidth : 10
        }));
        scene.add(lineArray[count]);

        // 終了処理　－　アラート表示
        var myRet = confirm("Do you want to add this region?");
        if (myRet == true) {
          pickingMode = false
          eventBus.emit("REGISTER_SECOND_STEP", pointArray)
        } else {
          this.resetCreateTarget()
        }
      }
      else{
        // 点を描く using BufferGeometry and Points
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))
        const material = new THREE.PointsMaterial({map: discTexture, transparent: true, size: 3.0})
        _point = new THREE.Points(geometry, material)

        console.log(targets);
        let k = 0;
        if(targets[0].face == null)
          k = 1;
        const normal = targets[k].face.normal;
        console.log(targets[k].point);
        console.log(normal);
        _point.position.set(
          targets[k].point.x + offset * normal.x,
          targets[k].point.y + offset * normal.y,
          targets[k].point.z + offset * normal.z
        );
        _point.name = 'point' + count;
        _pointArray[count] = _point;
        mastaba.push(_point);
        scene.add(_pointArray[count]);
        pointArray[count] = targets[0].point; //正しいピッキングの位置
        console.log(pointArray[count]);

        // 2回目以降　ー　線を描く
        if (count > 0) {
          const positions = [
            _pointArray[count - 1].position.x,
            _pointArray[count - 1].position.y,
            _pointArray[count - 1].position.z,
            _pointArray[count].position.x,
            _pointArray[count].position.y,
            _pointArray[count].position.z
          ]
          const lg = new THREE.BufferGeometry()
          lg.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
          lineArray[count - 1] = new THREE.Line(lg, new THREE.LineBasicMaterial({
            color : 0xff0000,
            opacity : 0.5,
            linewidth : 10
          }));
          scene.add(lineArray[count - 1]);
        }

        // カウントする
        count++;
      }
    }
  }

  resetCreateTarget() {
    pointArray.forEach((point, i) => {
      scene.remove(point)
      scene.remove(_pointArray[i])
    })
    lineArray.forEach(line => {
      scene.remove(line)
    })
    for(let i = 0; i < mastaba.length - 4; i++){
      mastaba.splice(5, 1);
    }
    count = 0;
    targets = [];
  }
}
