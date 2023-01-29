import {app, Entity, tag, type, value} from "@javelin/ecs"
import {perf} from "@javelin/perf"
import {makePresence, presenceMessageType} from "./presence.js"
import {makeProtocol} from "./protocol.js"
import {ReadStream, WriteStream} from "./stream.js"

let protocol = makeProtocol().addMessageType(presenceMessageType)

let a = value({x: "f32", y: "f32", z: "f32", w: "f32"})
let b = value("f32")
let c = tag()

perf("presenceMessageType.encode", () => {
  let T = type(a, b, c)
  let count = 10
  let writeStream = new WriteStream()
  let interest = makePresence(99 as Entity, T)
  let {world} = app()
    .addInitSystem(world => {
      for (let i = 0; i < count; i++) {
        world.create(T)
      }
    })
    .step()
    .step()
  return () => {
    protocol.encode(world, writeStream, presenceMessageType, interest)
  }
})

perf("presenceMessageType.decode", () => {
  let count = 10
  let T = type(a, b, c)
  let writeStream = new WriteStream()
  let interest = makePresence(99 as Entity, T)
  let {world: targetWorld} = app()
  let {world: sourceWorld} = app()
    .addInitSystem(world => {
      for (let i = 0; i < count; i++) {
        world.create(T)
      }
    })
    .step()
    .step()
  protocol.encode(sourceWorld, writeStream, presenceMessageType, interest)
  let readStream = new ReadStream(writeStream.bytes())
  return () => {
    protocol.decode(targetWorld, readStream)
  }
})
