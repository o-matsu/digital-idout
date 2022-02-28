// import Common from './Common'
// import Shape from './Shape'
import THREE from './lib/three_r70.min.js'
import EventBus from '~/utils/EventBus'
require('./lib/myFirstPersonControls2.js')

let renderer
let scene
let camera
let controls
let targets = []
let regionsViewFlag = false
const mastaba = []
const polyArray = []
const clock = new THREE.Clock()

// three.jsの処理を書いていく
export default class ThreeBrain {
  constructor(props) {
    this.props = props
    this.init()
    //
    EventBus.$on("DRAW_REGIONS", this.drawRegions.bind(this));
    EventBus.$on("TOGGLE_REGIONS_VIEW", this.toggleRegionsView.bind(this));
    EventBus.$on("MOUSE_CLICK", this.mouseClick.bind(this));
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
    renderer = new THREE.WebGLRenderer({
      canvas: $canvas,
    })
    if (!renderer) alert('初期化失敗')
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1.0)
    scene = new THREE.Scene()

    // メニューリサイズ
    // $('#menu-left').height('100%');
    // $('#menu-left').children().height('100%');
    // $('#menu-right').height('100%');
    // $('#menu-right').children().height('100%');

    // マウスイベント
    renderer.domElement.addEventListener('mousemove', this.mouseMove.bind(this), false);
  }

  initCamera($canvas) {
    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      400,
    )
    camera.up.set(0, 1, 0)

    controls = new THREE.FirstPersonControls(camera, $canvas)
    controls.movementSpeed = 10
    controls.lookSpeed = 0.2
  }

  initLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)
  }

  initObject() {
    // load Scan model
    const loader = new THREE.JSONLoader(true)
    loader.load(
      '/models/north_tex.json',
      function (geometry, materials) {
        const material = new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture('/models/north_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[0] = mesh
        scene.add(mastaba[0])
      },
      '/models/',
    )
    loader.load(
      '/models/east_tex.json',
      function (geometry, materials) {
        const material = new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture('/models/east_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[1] = mesh
        scene.add(mastaba[1])
      },
      '/models/',
    )
    loader.load(
      '/models/ceiling_tex.json',
      function (geometry, materials) {
        const material = new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture('/models/ceiling_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[2] = mesh
        scene.add(mastaba[2])
      },
      '/models/',
    )
    loader.load(
      '/models/south_tex.json',
      function (geometry, materials) {
        const material = new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture('/models/south_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[3] = mesh
        scene.add(mastaba[3])
      },
      '/models/',
    )
    loader.load(
      '/models/west_tex.json',
      function (geometry, materials) {
        const material = new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture('/models/west_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        mastaba[4] = mesh
        scene.add(mastaba[4])
      },
      '/models/',
    )
    // 床
    loader.load(
      '/models/floor.json',
      function (geometry, materials) {
        const material = new THREE.MeshPhongMaterial({
          wireframe: true,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        scene.add(mesh)
      },
      '/models/',
    )
    // // テクスチャ切替用モデル
    // loader.load('res/north_orthoB.json', function (geometry, materials) {
    //   layerModel_init(geometry, materials, 0)
    // })

    // loader.load('res/east_ortho.json', function (geometry, materials) {
    //   layerModel_init(geometry, materials, 1)
    // })
  }

  // drawRegions(_json, mmode) {
  drawRegions(regions) {
    const edgeArray = []
    const offset = 0.5
    regions.forEach(region => {
      const edges = new THREE.Geometry()
      const vertices = region.data.points.map(point => {
        return new THREE.Vector3(point.x, point.y, point.z)
      })
      vertices.forEach(vertex => {
        edges.vertices.push(vertex)
      })
      edges.vertices.push(vertices[0])
      const line = new THREE.Line(edges, new THREE.LineBasicMaterial({
        color : 0xff0000,
        opacity : 0.5,
        linewidth : 10,
        visible : false
      }))
      line.name = region.id
      edgeArray.push(line)
      scene.add(line)

      const targetRegion = new THREE.Geometry()
      targetRegion.vertices = edges.vertices
      for(let j = 0; j < targetRegion.vertices.length - 3; j++){
        targetRegion.faces.push(new THREE.Face3(0, j + 1, j + 2))
      }
      targetRegion.computeFaceNormals()
      const mesh = new THREE.Mesh(targetRegion, new THREE.MeshBasicMaterial({
        color : 0xffddaa,
        transparent : true,
        opacity : 0.2,
        visible : false
      }))
      polyArray.push(mesh)

      // 法線方向へoffsetだけずらす // // //
      line.position.set(
        line.position.x + offset * mesh.geometry.faces[0].normal.x,
        line.position.y + offset * mesh.geometry.faces[0].normal.y,
        line.position.z + offset * mesh.geometry.faces[0].normal.z
        )
      mesh.name = region.id
      line.add(mesh);
    })
    // if (mmode == 1) {
    //   console.log(polyArray);
    //   successCreT2(polyArray[_json.length - 1]);
    // }

    console.log(scene)
  }

  draw() {
    renderer.clear()
    renderer.render(scene, camera)
    controls.update(clock.getDelta())
    requestAnimationFrame(this.draw.bind(this))
  }

  resize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  mouseMove(e) {
    const raycaster = new THREE.Raycaster()
    // const target_v = null
    const mouse = new THREE.Vector2()

    e.preventDefault();
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1
    const vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(camera)
    raycaster.set( camera.position, vector.sub( camera.position ).normalize())

    // 領域追加モード：ピッキング対象をモデルに
    // if ($('#button_createtarget').hasClass('active')){
    //   var intersects = raycaster.intersectObjects(mastaba, true);
    // }

    // その他のモード：ピッキング対象を領域に
    // else
    const intersects = raycaster.intersectObjects(polyArray, true)

    // if ($('#button_createtarget').hasClass('active')) {
    //   if (intersects.length) {
    //     target_v = intersects;
    //     if(target_v[0].object.name == "point0" && count > 2 && point0_state < 0){
    //       point0_state *= -1;
    //       target_v[0].object.material.size = 5.0;

    //     }else if(target_v[0].object.name != "point0" && point0_state > 0){
    //       point0_state *= -1;
    //       _pointArray[0].material.size = 3.0;
    //     }
    //   } else if (!intersects.length) {
    //     target_v = null;
    //   }
    // }else if ($('#form_back').css('display') == 'none' && $('#infobox').css('display') == 'none' && infoload == 1) {
    if (intersects.length > 0) {
      if (!targets) {
        targets = intersects
        console.log(targets[0])
        this.showTargets(targets)
      } else if (intersects.length !== targets.length || intersects[0].object.name !== targets[0].object.name) {
        this.hideTargets(targets)
        targets = intersects
        this.showTargets(targets)
      }
    } else if (targets) {
        this.hideTargets(targets)
        targets = []
    }
    // }
    renderer.render(scene, camera);
  }

  mouseClick(e) {
    console.log("wao");
    if(targets.length > 0) {
      EventBus.$emit("PICK_REGIONS", targets)
    }

    // if ($('#button_createtarget').hasClass('active')) {
    //   CreateTargetOBJ();
    // } else if ($('#form_back').css('display') != 'none') {
    // } else {
    //   pop();
    // }
  }

  showTargets(targets) {
    if (!regionsViewFlag) {
      targets.forEach(target => {
        target.object.material.visible = true
        target.object.parent.material.visible = true
      })
    }else{
      targets.forEach(target => {
        target.object.parent.material.color.setHex(0x0000ff)
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
        target.object.parent.material.color.setHex(0xff0000);
      })
    }
  }

  toggleRegionsView(flag) {
    regionsViewFlag = flag
		if (regionsViewFlag) {
			console.log("ok")
			if (targets){
				this.showTargets(targets)
				// if($('#form_back').css('display') != 'none'){
				// 	targetTopColor();
				// }
			}
      polyArray.forEach(poly => {
				poly.material.visible = true
				poly.parent.material.visible = true
      })
		}
		else {
      polyArray.forEach(poly => {
				poly.material.visible = false
				poly.parent.material.visible = false
      })
			if (targets) {
        targets.forEach(target => {
          target.object.parent.material.color.setHex(0xff0000)
        })
				this.showTargets(targets)
				// if($('#form_back').css('display') != 'none'){
				// 	targetTopColor();
				// }
			}
		}
  }
}
