import {app, Entity, tag, type, value} from "@javelin/ecs"
import {expect, suite, test} from "vitest"
import * as Interest from "./interest.js"
import * as Protocol from "./protocol.js"
import {ReadStream} from "./read_stream.js"
import {WriteStream} from "./write_stream.js"

let A = tag()
let B = value({x: "f32", y: "f32"})
let AB = type(A, B)

let protocol = Protocol.make()
Protocol.add_message_type(protocol, Interest.message_type)

suite("interest", () => {
  test("works", () => {
    let stream = new WriteStream()
    let interest = Interest.make(99 as Entity, AB, undefined, 10)
    let source_app = app()
    let target_app = app()
    let e: Entity
    let b = {x: 5, y: 6}
    source_app
      .addInitSystem(world => {
        e = world.create(AB, b)
      })
      .addSystem(world => {
        Interest.update_priorities(interest, world)
      })
      .step()
      .step()
    Protocol.encode(
      protocol,
      source_app.world,
      stream,
      Interest.message_type,
      interest,
    )
    Protocol.decode(
      protocol,
      target_app.world,
      new ReadStream(stream.bytes()),
    )
    target_app.step()
    expect(target_app.world.get(e!, B)).toEqual(b)
  })
})
