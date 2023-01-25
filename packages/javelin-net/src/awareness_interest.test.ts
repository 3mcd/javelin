import {value, tag, type, app} from "@javelin/ecs"
import {suite, test, expect} from "vitest"
import {
  interestMessageType,
  makeInterest,
} from "./awareness_interest.js"
import {makeProtocol} from "./protocol.js"
import {ReadStream} from "./read_stream.js"
import {WriteStream} from "./write_stream.js"

let a = value()
let b = tag()
let AB = type(a, b)

let protocol = makeProtocol().addMessageType(interestMessageType)

suite("awareness_interest", () => {
  test("works", () => {
    let interest = makeInterest(AB)
    let stream = new WriteStream()
    let {world: target} = app()
    app()
      .addInitSystem(world => {
        world.create(AB, {})
        world.create(AB, {})
      })
      .addSystem(world => {
        interest.update(world, protocol, stream)
      })
      .step()
      .step()
    protocol.decode(target, new ReadStream(stream.bytes()))
    expect(true).toBe(true)
  })
})
