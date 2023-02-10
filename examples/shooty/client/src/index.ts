import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {movePlayerSystem} from "../../server/player.js"
import {Identity, identityMessage} from "../../shared/identity.js"
import {Input, model, Position, Vector2} from "../../shared/model.js"

let socket = new WebSocket("ws://localhost:8080")

let keys: Record<string, boolean> = {
  w: false,
  a: false,
  s: false,
  d: false,
}

let lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

let Viewport = j.resource<Vector2>()
let Canvas = j.resource<HTMLCanvasElement>()
let CanvasContext = j.resource<CanvasRenderingContext2D>()

let drawCircle = (
  canvasContext: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  fill = false,
) => {
  canvasContext.save()
  canvasContext.translate(x, y)
  canvasContext.strokeStyle = color
  canvasContext.lineWidth = 0.2
  canvasContext.beginPath()
  canvasContext.arc(0, 0, radius, 0, 2 * Math.PI)
  canvasContext.stroke()
  if (fill) {
    canvasContext.globalAlpha = 0.1
    canvasContext.fillStyle = color
    canvasContext.fill()
  }
  canvasContext.restore()
}

let resizeViewportSystem = (world: j.World) => {
  let viewport = world.getResource(Viewport)
  let canvas = world.getResource(Canvas)
  let onResize = () => {
    let rect = canvas.getBoundingClientRect()
    viewport.x = rect.width
    viewport.y = rect.height
  }
  document.addEventListener("resize", onResize)
  onResize()
}

let drawPlayersSystem = (world: j.World) => {
  let context = world.getResource(CanvasContext)
  let alpha = world.getResource(jn.PredictionBlendProgress)
  let a = world.getResource(jn.PredictedWorld)
  let b = world.getResource(jn.CorrectedWorld)
  a.query(Position).each((entity, pos) => {
    let correctedPos = b.get(entity, Position)!
    drawCircle(
      context,
      lerp(pos.x, correctedPos.x, alpha),
      lerp(pos.y, correctedPos.y, alpha),
      1,
      "red",
      true,
    )
  })
}

document.addEventListener("keydown", e => {
  keys[e.key] = true
})
document.addEventListener("keyup", e => {
  keys[e.key] = false
})

let canvas = document.querySelector("canvas")!
let canvasContext = canvas.getContext("2d")!

let onResize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvasContext.scale(10, 10)
}
onResize()

window.addEventListener("resize", onResize)

let app = j.app()
app
  .addResource(Canvas, canvas)
  .addResource(CanvasContext, canvasContext)
  .addResource(Viewport, {x: 0, y: 0})
  .addResource(jn.NetworkModel, model)
  .addInitSystem(world => {
    world.create(j.type(jn.Server), jn.makeWebsocketTransport(socket))
  })
  .addSystemToGroup(
    j.FixedGroup.Early,
    world => {
      let commands = world.getResource(j.Commands)
      let identity = world.getResource(Identity)
      let h = +keys.d - +keys.a
      let v = +keys.s - +keys.w
      if (h !== 0 || v !== 0) {
        commands.dispatch(Input, {entity: identity, h, v})
      }
    },
    null,
    world => world.tryGetResource(Identity) !== undefined,
  )
  .use(jn.clientPlugin)
  .use(app => {
    let protocol = app.getResource(jn.NetworkProtocol)!
    protocol.register(identityMessage, 99)
  })
  .addSystemToGroup(jn.PredictionGroup.Update, movePlayerSystem)
  .addSystemToGroup(jn.PredictionGroup.Render, drawPlayersSystem)
  .addInitSystem(resizeViewportSystem)
  .addSystemToGroup(j.Group.LateUpdate, world => {
    let viewport = world.getResource(Viewport)
    let context = world.getResource(CanvasContext)
    context.clearRect(0, 0, viewport.x, viewport.y)
  })

let loop = () => {
  app.step()
  requestAnimationFrame(loop)
}

loop()
