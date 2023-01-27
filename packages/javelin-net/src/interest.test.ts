import {app, Entity, tag, type, value} from "@javelin/ecs"
import {expect, suite, test} from "vitest"
import {makeInterest, interestMessageType} from "./interest.js"
import {makeProtocol} from "./protocol.js"
import {ReadStream, WriteStream} from "./stream.js"

let A = tag()
let B = value({x: "f32", y: "f32"})
let AB = type(A, B)

let protocol = makeProtocol().addMessageType(interestMessageType)

suite("Interest", () => {
  test("encode/decode", () => {
    let count = 20
    let stream = new WriteStream()
    let interest = makeInterest(99 as Entity, AB)
    let sourceApp = app()
    let targetApp = app()
    let entity: Entity[] = []
    let bValue = {x: 5, y: 6}
    sourceApp
      .addInitSystem(world => {
        for (let i = 0; i < count; i++) {
          entity.push(world.create(AB, bValue))
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
      expect(targetApp.world.get(entity[i], B)).toEqual(bValue)
    }
  })
})
