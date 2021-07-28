import {
  ComponentOf,
  createQuery,
  createWorld,
  number,
  toComponent,
  useInit,
  useMonitor,
} from "@javelin/ecs"
import * as Cannon from "cannon-es"
import * as Three from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import "./index.css"

const Vec3 = { x: number, y: number, z: number }
const Quaternion = { x: number, y: number, z: number, w: number }
const Body = { position: Vec3, quaternion: Quaternion }
const Mesh = { position: Vec3, quaternion: Quaternion }
const canvas = document.getElementById("game") as HTMLCanvasElement
const renderer = new Three.WebGLRenderer({ antialias: true, canvas })
const camera = new Three.PerspectiveCamera(45, 1, 0.1, 2000000)
const controls = new OrbitControls(camera, renderer.domElement)
const scene = new Three.Scene()
const simulation = new Cannon.World({ gravity: new Cannon.Vec3(0, -9.81, 0) })

scene.add(
  new Three.AmbientLight(0x404040),
  new Three.DirectionalLight(0xffffff, 0.5),
)

function scale() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener("resize", scale, false)
scale()

function createBox(
  position = new Cannon.Vec3(0, 0, 0),
  halfExtents = new Cannon.Vec3(0.5, 0.5, 0.5),
  type: Cannon.BodyType = Cannon.Body.DYNAMIC,
  color = 0xff0000,
  mass = 1,
) {
  const shape = new Cannon.Box(halfExtents)
  const body = new Cannon.Body({ mass, type, position, shape })
  const geometry = new Three.BoxGeometry(
    halfExtents.x * 2,
    halfExtents.y * 2,
    halfExtents.z * 2,
  )
  const material = new Three.MeshLambertMaterial({ color })
  const mesh = new Three.Mesh(geometry, material)
  return [
    // identify our third-party objects as Javelin components
    toComponent(body, Body),
    toComponent(mesh, Mesh),
  ]
}

function createGround() {
  return createBox(
    new Cannon.Vec3(0, 0, 0),
    new Cannon.Vec3(10, 0.1, 10),
    Cannon.Body.STATIC,
    0xffffff,
    0,
  )
}

function copyBodyToMesh(
  body: ComponentOf<typeof Body>,
  mesh: ComponentOf<typeof Mesh>,
) {
  mesh.position.x = body.position.x
  mesh.position.y = body.position.y
  mesh.position.z = body.position.z
  mesh.quaternion.x = body.quaternion.x
  mesh.quaternion.y = body.quaternion.y
  mesh.quaternion.z = body.quaternion.z
  mesh.quaternion.w = body.quaternion.w
}

function random(scale = 2) {
  return (0.5 - Math.random()) * scale
}

const world = createWorld<number>()
const bodies = createQuery(Body, Mesh)

world.addSystem(function spawn({ create }) {
  if (useInit()) {
    // spawn the ground
    create(...createGround())
    // spawn boxes at semi-random points
    for (let i = 0; i < 200; i++) {
      create(...createBox(new Cannon.Vec3(random(20), 20, random(20))))
    }
  }
})

world.addSystem(function physics({ latestTickData: dt }) {
  useMonitor(bodies, (e, [body]) => {
    // add body to simulation
    simulation.addBody(
      // manually cast the component to it's true type since we lose type
      // information by storing it in the ECS
      body as Cannon.Body,
    )
  })
  simulation.step(dt / 1000)
})

world.addSystem(function render() {
  // add camera to scene
  if (useInit()) {
    scene.add(camera)
    camera.position.x = 50
    camera.position.y = 50
    camera.position.z = 50
  }
  // add meshes to scene
  useMonitor(bodies, (e, [, mesh]) => scene.add(mesh as Three.Mesh))
  // copy body position to mesh
  bodies((e, [body, mesh]) => copyBodyToMesh(body, mesh))
  // render scene
  controls.update()
  renderer.render(scene, camera)
})

let prev = 0

function step(now: number) {
  world.step(now - (prev || now))
  requestAnimationFrame(step)
  prev = now
}

requestAnimationFrame(step)
