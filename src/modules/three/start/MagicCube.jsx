import React from "react"
import * as THREE from "three"
import * as OrbitControls from "three-orbitcontrols"
import delay from "../../../utils/delay"

const IMG_ARRAY = [
  require("../../../assets/images/uv-ge.jpg"),
  require("../../../assets/images/uv-chen.jpg"),
  require("../../../assets/images/uv-ai.jpg"),
  require("../../../assets/images/uv-gao.jpg"),
  require("../../../assets/images/uv-feng.jpg"),
  require("../../../assets/images/uv-niu.jpg"),
]

const POSITION = [
  [0, 0, 30],
  [0, 0, -30],
  [0, 30, 0],
  [0, -30, 0],
  [30, 0, 0],
  [-30, 0, 0],

  [0, 30, 30],
  [0, 30, -30],
  [0, -30, 30],
  [0, -30, -30],

  [30, 0, 30],
  [30, 0, -30],
  [-30, 0, 30],
  [-30, 0, -30],

  [30, 30, 0],
  [30, -30, 0],
  [-30, 30, 0],
  [-30, -30, 0],

  [30, 30, 30],
  [30, 30, -30],
  [30, -30, 30],
  [30, -30, -30],

  [-30, 30, 30],
  [-30, 30, -30],
  [-30, -30, 30],
  [-30, -30, -30],
]

class Introduce extends React.Component {
  constructor(props) {
    super(props)
    this.scene = null
    this.renderer = null
    this.camera = null

    this.cubeMesh = null
    this.clock = null
  }

  componentDidMount() {
    this.init()
  }

  async init() {
    this.scene = new THREE.Scene()
    this.initMesh()

    //辅助坐标系
    let axisHelper = new THREE.AxisHelper(250)
    this.scene.add(axisHelper)

    //点光源
    let point = new THREE.PointLight(0xffffff)
    point.position.set(400, 200, 300) //点光源位置
    this.scene.add(point) //点光源添加到场景中
    //环境光
    let ambient = new THREE.AmbientLight(0xaaaaaa)
    this.scene.add(ambient)

    await delay(10)
    let width = this.refs.three.clientWidth //window.innerWidth //窗口宽度
    let height = this.refs.three.clientHeight //window.innerHeight //窗口高度
    let k = width / height //窗口宽高比
    let s = 200 //三维场景显示范围控制系数，系数越大，显示的范围越大
    //创建相机 CAMERA
    this.camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000)
    this.camera.position.set(300, 300, 100) //设置相机位置
    this.camera.lookAt(this.scene.position) //设置相机方向(指向的场景对象)
    // RENDERER
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(width, height) //设置渲染区域尺寸
    this.renderer.setClearColor(0x00000, 1) //设置背景颜色
    this.refs.three.appendChild(this.renderer.domElement) //body元素中插入canvas对象
    //执行渲染操作   指定场景、相机作为参数
    this.clock = new THREE.Clock()
    //this.renderer.render(this.scene, this.camera)
    this.beginRotate()
    new OrbitControls(this.camera, this.renderer.domElement)

    // let controls = new OrbitControls(this.camera, this.renderer.domElement)
    // controls.addEventListener("change", this.renderGL.bind(this))
  }

  initMesh() {
    let cubeGeo = new THREE.BoxGeometry(30, 30, 30) //创建一个立方体几何对象Geometry
    let meshFaceMaterial = []
    IMG_ARRAY.forEach((img) => {
      meshFaceMaterial.push(
        new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture(img),
          side: THREE.DoubleSide,
        })
      )
    })

    this.cubeMesh = new THREE.Mesh(cubeGeo, meshFaceMaterial)
    this.cubeMesh.position.set(0, 0, 0)
    this.scene.add(this.cubeMesh)

    POSITION.forEach((item) => {
      let newCubeMesh = this.cubeMesh.clone()
      newCubeMesh.position.set(...item)
      this.scene.add(newCubeMesh)
    })
  }

  async beginRotate(axis = "x") {
    let target = [30, 0, -30][this.random3()]
    let group = []
    let cubes = this.scene.children
    for (let i = cubes.length - 1; i >= 0; i--) {
      if (cubes[i].type === "Mesh" && cubes[i].position[axis] === target) {
        group.push(cubes[i])
      }
    }
    console.log(group.length)
    window.scene = this.scene
    this.renderGL(group, axis, Math.PI / 2, 2)
    // await delay(2000)
    // window.cancelAnimationFrame(this.requestAnimationFrame)
    // //await delay(1000)
    // this.correctPosition()
    // this.beginRotate(["x", "y", "z"][this.random3()])
  }

  correctPosition() {
    this.scene.children.forEach((item) => {
      if (item.type === "Mesh") {
        ;["x", "y", "z"].forEach((axis) => {
          if (Math.abs(item.position[axis]) < 5) {
            item.position[axis] = 0
          } else if (item.position.x > 25) {
            item.position[axis] = 30
          } else if (item.position.x < -25) {
            item.position[axis] = -30
          }
        })
      }
    })
  }

  async renderGL(group, axis, angle, T) {
    let delta = this.clock.getDelta()
    let cita = (angle * delta) / T
    this.renderer.render(this.scene, this.camera)
    if (axis === "x") {
      group.forEach((item) => {
        let _x = item.position.x,
          _y = item.position.y,
          _z = item.position.z,
          x = _x,
          y = _y * Math.cos(cita) - _z * Math.sin(cita),
          z = _z * Math.cos(cita) + _y * Math.sin(cita)
        item.position.set(x, y, z) //中心点旋转
        item.rotateX(cita) //自旋
      })
    } else if (axis === "y") {
      group.forEach((item) => {
        let _x = item.position.x,
          _y = item.position.y,
          _z = item.position.z,
          x = _x * Math.cos(cita) - _z * Math.sin(cita),
          y = _y,
          z = _z * Math.cos(cita) + _x * Math.sin(cita)
        item.position.set(x, y, z) //中心点旋转
        item.rotateY(cita) //自旋
      })
    } else {
      group.forEach((item) => {
        let _x = item.position.x,
          _y = item.position.y,
          _z = item.position.z,
          x = _x * Math.cos(cita) + _y * Math.sin(cita),
          y = _y * Math.cos(cita) - _x * Math.sin(cita),
          z = _z
        item.position.set(x, y, z) //中心点旋转
        item.rotateZ(cita) //自旋
      })
    }
    this.requestAnimationFrame = window.requestAnimationFrame(
      this.renderGL.bind(this, group, axis, angle, T)
    )
  }

  random3() {
    let number = Math.random()
    if (number < 0.3333) {
      return 0
    } else if (number >= 0.3333 && number < 0.6666) {
      return 1
    } else {
      return 2
    }
  }

  render() {
    return (
      <div
        ref="three"
        id="three"
        style={{ width: "100%", height: "100%" }}
      ></div>
    )
  }
}

export default Introduce
