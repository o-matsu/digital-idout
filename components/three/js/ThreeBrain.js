// import Common from './Common'
// import Shape from './Shape'
import THREE from './lib/three_r70.min.js'
require('./lib/myFirstPersonControls2.js')

let renderer
let scene
let camera
let controls
const mastaba = []
const clock = new THREE.Clock()

// three.jsの処理を書いていく
export default class ThreeBrain {
  constructor(props) {
    this.props = props
    this.init()
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
    // renderer.domElement.addEventListener('mousemove', mouseMove, false);
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
}
