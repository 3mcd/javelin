import {tag, type, value, World} from "@javelin/ecs"
import {perf} from "@javelin/perf"
import {compileDecodeComposeEntity, compileEncodeEntity} from "./encode.js"

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
    compileDecodeComposeEntity(T, world)
  }
})
