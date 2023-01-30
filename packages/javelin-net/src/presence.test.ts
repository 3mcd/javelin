import {app, Entity, tag, type, value} from "@javelin/ecs"
import {expect, suite, test} from "vitest"
import {makePresence, presenceMessageType} from "./presence.js"
import {makeProtocol} from "./protocol.js"
import {ReadStream, WriteStream} from "./stream.js"

let A = tag()
let B = value({x: "f32", y: "f32"})
let T = type(A, B)

let protocol = makeProtocol().addMessageType(presenceMessageType)

suite("Presence", () => {
  test("encode/decode", () => {
    let count = 20
    let stream = new WriteStream()
    let sourceApp = app()
    let targetApp = app()
    let interest = makePresence(sourceApp.world.create(), T)
    let entities: Entity[] = []
    sourceApp
      .addInitSystem(world => {
        for (let i = 0; i < count; i++) {
          entities.push(world.create(T))
        }
      })
      .step()
      .step()
    protocol.encodeMessage(
      sourceApp.world,
      stream,
      presenceMessageType,
      interest,
    )
    protocol.decodeMessage(targetApp.world, new ReadStream(stream.bytes()))
    targetApp.step()
    for (let i = 0; i < count; i++) {
      expect(targetApp.world.get(entities[i], B)).toEqual({x: 0, y: 0})
    }
  })
})
