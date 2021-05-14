const { registerSchema, component } = require("@javelin/ecs")
const { number, arrayOf } = require("@javelin/core")
const { performance } = require("perf_hooks")
const { set, push, ChangeSet } = require("../dist/cjs")

const Position = { x: number, y: number, buffer: arrayOf(number) }

registerSchema(Position, 0)
registerSchema(ChangeSet, 1)

const p = component(Position)
const c = component(ChangeSet)
const n = 100000
const t = performance.now()

for (let i = 0; i < n; i++) {
  set(p, c, "x", i + 1)
  set(p, c, "y", i - 1)
  // push(p, c, "buffer", 1)
}

console.log(performance.now() - t)
