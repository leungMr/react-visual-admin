import React from "react"
import * as THREE from "three"
import * as OrbitControls from "three-orbitcontrols"
import delay from "../../../utils/delay"
// const THREE = require("three")
// const OrbitControls = require("three-orbitcontrols")
// 两种引入方式都可以

class Introduce extends React.Component {
  constructor(props) {
    super(props)
    this.scene = null
    this.renderer = null
    this.camera = null

    this.cubeMesh = null
    this.sphereMesh = null
    this.cylindeMesh = null

    this.T0 = 0
    this.T1 = 0
  }

  componentDidMount() {
    this.init()
    // setInterval(() => {
    //   this.renderGL()
    // }, 20)
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
    let ambient = new THREE.AmbientLight(0x444444)
    this.scene.add(ambient)

    await delay(10)
    let width = this.refs.three.clientWidth //window.innerWidth //窗口宽度
    let height = this.refs.three.clientHeight //window.innerHeight //窗口高度
    let k = width / height //窗口宽高比
    let s = 200 //三维场景显示范围控制系数，系数越大，显示的范围越大
    //创建相机 CAMERA
    this.camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000)
    this.camera.position.set(200, 100, 100) //设置相机位置
    this.camera.lookAt(this.scene.position) //设置相机方向(指向的场景对象)
    // RENDERER
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(width, height) //设置渲染区域尺寸
    this.renderer.setClearColor(0x00000, 1) //设置背景颜色
    this.refs.three.appendChild(this.renderer.domElement) //body元素中插入canvas对象
    //执行渲染操作   指定场景、相机作为参数
    this.T0 = new Date()
    this.renderGL()
    new OrbitControls(this.camera, this.renderer.domElement)

    // let controls = new OrbitControls(this.camera, this.renderer.domElement)
    // controls.addEventListener("change", this.renderGL.bind(this))
  }

  initMesh() {
    let sphereGeo = new THREE.SphereGeometry(50, 10, 10) //创建一个球体几何对象
    let cubeGeo = new THREE.BoxGeometry(200, 100, 50) //创建一个立方体几何对象Geometry
    let cylindeGeo = new THREE.CylinderGeometry(50, 30, 90, 100, 100)
    let materialLambert = new THREE.MeshLambertMaterial({
      color: 0x0000ff,
      opacity: 0.7,
      transparent: true,
    })
    let materialBasic = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
    })
    let materialPhong = new THREE.MeshPhongMaterial({
      color: 0x0000ff,
      specular: 0x4488ee,
      shininess: 12,
    })
    this.cubeMesh = new THREE.Mesh(cubeGeo, materialLambert)
    this.sphereMesh = new THREE.Mesh(sphereGeo, materialBasic)
    this.cylindeMesh = new THREE.Mesh(cylindeGeo, materialPhong)
    this.cubeMesh.position.set(0, 0, 0)
    this.sphereMesh.position.set(0, 100, 0) //几何体中心位置
    this.cylindeMesh.position.set(200, 0, 0)
    this.scene.add(this.cubeMesh)
    this.scene.add(this.sphereMesh)
    this.scene.add(this.cylindeMesh)
  }

  renderGL() {
    // 保证每次执行时间内转动的角度是一样的
    this.T1 = new Date()
    let t = this.T1 - this.T0
    this.T0 = this.T1
    //console.log(t) // t = 16.7ms 16~17
    this.renderer.render(this.scene, this.camera) //执行渲染操作
    this.cubeMesh.rotateY(0.001 * t) //每次绕y轴旋转0.01弧度 一周2PI 6.28 每秒转0.5
    this.sphereMesh.rotateY(0.002 * t)
    requestAnimationFrame(this.renderGL.bind(this))
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
