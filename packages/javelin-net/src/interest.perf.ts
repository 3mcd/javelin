import {app, Entity, tag, type, value, World} from "@javelin/ecs"
import {perf} from "@javelin/perf"
import {
  compileDecodeEntity,
  compileEncodeEntity,
  interestMessageType,
  makeInterest,
} from "./interest.js"
import {makeProtocol} from "./protocol.js"
import {ReadStream, WriteStream} from "./stream.js"

let protocol = makeProtocol().addMessageType(interestMessageType)

let a = value({x: "f32", y: "f32", z: "f32", w: "f32"})
let b = value("f32")
let c = tag()

perf("compileEncodeEntity", () => {
  let T = type(a, b, c)
  let world = new World()
  return () => {
    compileEncodeEntity(T, world)
  }
})

perf("compileDecodeEntity", () => {
  let T = type(a, b, c)
  let world = new World()
  return () => {
    compileDecodeEntity(T, world)
  }
})

perf("interestMessageType.encode", () => {
  let T = type(a, b, c)
  let count = 10
  let writeStream = new WriteStream()
  let interest = makeInterest(99 as Entity, T)
  let {world} = app()
    .addInitSystem(world => {
      for (let i = 0; i < count; i++) {
        world.create(T)
      }
    })
    .addSystem(world => {
      interest.prioritize(world)
    })
    .step()
    .step()
  return () => {
    protocol.encode(world, writeStream, interestMessageType, interest)
  }
})

perf("interestMessageType.decode", () => {
  let count = 10
  let T = type(a, b, c)
  let writeStream = new WriteStream()
  let interest = makeInterest(99 as Entity, T)
  let {world: targetWorld} = app()
  let {world: sourceWorld} = app()
    .addInitSystem(world => {
      for (let i = 0; i < count; i++) {
        world.create(T)
      }
    })
    .addSystem(world => {
      interest.prioritize(world)
    })
    .step()
    .step()
  protocol.encode(sourceWorld, writeStream, interestMessageType, interest)
  let readStream = new ReadStream(writeStream.bytes())
  return () => {
    protocol.decode(targetWorld, readStream)
  }
})
