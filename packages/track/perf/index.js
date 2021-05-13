const { performance } = require("perf_hooks")
const { track, ChangeSet } = require("../dist/cjs")
const { registerSchema, UNSAFE_internals, component } = require("@javelin/ecs")
const { number } = require("@javelin/core")

const Position = { x: number, y: number }

registerSchema(Position, 0)
registerSchema(ChangeSet, 1)

const position = component(Position)
const changes = component(ChangeSet)

const n = 1000000
const t = performance.now()

for (let i = 0; i < n; i++) {
  track(changes, position, "x", i + 1)
  track(changes, position, "y", i - 1)
}

console.log(performance.now() - t)
