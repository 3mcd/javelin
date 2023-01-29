import {app, Entity, tag, type, value} from "@javelin/ecs"
import {expect, suite, test} from "vitest"
import {makeInterest, interestMessageType} from "./interest.js"
import {makeProtocol} from "./protocol.js"
import {ReadStream, WriteStream} from "./stream.js"

let A = tag()
let B = value({x: "f32", y: "f32"})
let T = type(A, B)

let protocol = makeProtocol().addMessageType(interestMessageType)

suite("Interest", () => {
  test("encode/decode", () => {
    let count = 20
    let stream = new WriteStream()
    let interest = makeInterest(99 as Entity, T)
    let sourceApp = app()
    let targetApp = app()
    let entities: Entity[] = []
    let bValue = {x: 5, y: 6}
    sourceApp
      .addInitSystem(world => {
        for (let i = 0; i < count; i++) {
          entities.push(world.create(T, bValue))
        }
      })
      .addSystem(world => {
        interest.prioritize(world)
      })
      .step()
      .step()
    protocol.encode(sourceApp.world, stream, interestMessageType, interest)
    protocol.decode(targetApp.world, new ReadStream(stream.bytes()))
    targetApp.step()
    for (let i = 0; i < count; i++) {
      expect(targetApp.world.get(entities[i], B)).toEqual(bValue)
    }
  })
})
