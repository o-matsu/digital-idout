import THREE from './lib/three_r70.min.js'
import Common from './Common'

export default class Shape {
  constructor() {
    this.segments = 80
    this.mastaba = []
    this.init()
  }

  init() {
    // load Scan model
    this.loader = new THREE.JSONLoader(true)
    this.loader.load(
      'models/north_tex.json',
      function (geometry, materials) {
        const material = new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture('models/north_texture.png'),
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(20, 20, 20)
        // this.mastaba[0] = mesh
        // Common.scene.add(this.mastaba[0])
        console.log(mesh)
        Common.scene.add(mesh)
      },
      'models/',
    )
  }

  update() {
    this.box.rotation.y += 0.01
  }
}
