const { registerSchema, component } = require("@javelin/ecs")
const { number, arrayOf } = require("@javelin/core")
const { performance } = require("perf_hooks")
const { assign, ChangeSet } = require("../dist/cjs")

const Position = { x: number, y: number, buffer: arrayOf(number) }

registerSchema(Position, 0)
registerSchema(ChangeSet, 1)

const p = component(Position)
const c = component(ChangeSet)
const n = 1000000
const t = performance.now()

for (let i = 0; i < n; i++) {
  assign(c, p, "x", i + 1)
  assign(c, p, "y", i - 1)
}

console.log(performance.now() - t)
