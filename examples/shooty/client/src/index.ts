import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {movePlayerSystem} from "../../server/player.js"
import {Identity, identityMessage} from "../../shared/identity.js"
import {Input, model, Position, Vector2} from "../../shared/model.js"

let socket = new WebSocket("ws://localhost:8080")

let keys: Record<string, boolean> = {}

document.addEventListener("keydown", e => {
  keys[e.key] = true
})
document.addEventListener("keyup", e => {
  keys[e.key] = false
})

let app = j
  .app()
  .addResource(jn.NetworkModel, model)
  .addInitSystem(world => {
    world.create(j.type(jn.Server), jn.makeWebsocketTransport(socket))
  })
  .addSystemToGroup(
    j.FixedGroup.Early,
    world => {
      let commands = world.getResource(j.Commands)
      let identity = world.getResource(Identity)
      if (keys.w) {
        commands.dispatch(Input, {entity: identity})
      }
    },
    null,
    world => world.tryGetResource(Identity) !== undefined,
  )
  .addSystem(world => {
    let serverWorld = world.getResource(jn.PredictedWorld)
    serverWorld.query(Position).each((entity, pos) => {
      renderEntity(entity, pos.x, pos.y, "predicted")
    })
  })
  .addSystem(world => {
    let correctedWorld = world.getResource(jn.CorrectedWorld)
    correctedWorld.query(Position).each((entity, pos) => {
      renderEntity(entity, pos.x, pos.y, "corrected")
    })
  })
  .use(jn.clientPlugin)
  .use(app => {
    let protocol = app.getResource(jn.NetworkProtocol)!
    protocol.register(identityMessage, 99)
  })
  .addSystemToGroup(jn.PredictionGroup.Update, movePlayerSystem)
  .addSystemToGroup(jn.PredictionGroup.Render, world => {
    let alpha = world.getResource(jn.PredictionBlendProgress)
    let a = world.getResource(jn.PredictedWorld)
    let b = world.getResource(jn.CorrectedWorld)
    a.query(Position).each((entity, pos) => {
      let correctedPos = b.get(entity, Position)!
      renderEntity(
        entity,
        lerp(pos.x, correctedPos.x, alpha),
        lerp(pos.y, correctedPos.y, alpha),
        "blended",
      )
    })
  })

let lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

let loop = () => {
  app.step()
  requestAnimationFrame(loop)
}

loop()

type Mode = "predicted" | "corrected" | "blended"

let entityNodes = {} as Record<string, HTMLDivElement>
let renderEntity = (entity: j.Entity, x: number, y: number, mode: Mode) => {
  let entityId = entity + mode
  let entityNode = entityNodes[entityId]
  if (entityNode === undefined) {
    entityNode = document.createElement("div")
    entityNode.classList.add("entity", mode)
    entityNodes[entityId] = entityNode
    document.body.appendChild(entityNode)
    ;[...document.body.children]
      .sort((a, b) => {
        let res = +a.textContent![0] - +b.textContent![0]
        if (res === 0) {
          res =
            +a.classList.contains("blended") - +b.classList.contains("blended")
        }
        if (res === 0) {
          res =
            +a.classList.contains("corrected") -
            +b.classList.contains("corrected")
        }

        return res
      })
      .forEach(node => document.body.appendChild(node))
  }
  entityNode.textContent = `${entity}: ${x.toFixed(2)},${y.toFixed(2)}`
}
