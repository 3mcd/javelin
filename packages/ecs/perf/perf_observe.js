const {
  observe,
  $changes,
  component,
  number,
  arrayOf,
  objectOf,
  setOf,
  mapOf,
} = require("@javelin/ecs")
const {
  performance: { now },
} = require("perf_hooks")

module.exports.run = () => {
  function run(fn) {
    const t = now()
    fn()
    return (now() - t).toFixed(2)
  }

  function simpleStruct() {
    const c = component({ x: number, y: number })
    const o = observe(c)
    for (let i = 0; i < 100000; i++) {
      o.x = i
    }
  }

  function simpleArray() {
    const c = component({ array: arrayOf(number) })
    const o = observe(c)
    for (let i = 0; i < 100000; i++) {
      o.array[i] = o.array[i] ?? 1
    }
  }

  function simpleObject() {
    const c = component({ object: objectOf(number) })
    const o = observe(c)
    for (let i = 0; i < 100000; i++) {
      o.object[i] = 1
      delete o.object[i]
    }
  }

  function set() {
    const c = component({ set: setOf(number) })
    const o = observe(c)
    for (let i = 0; i < 100000; i++) {
      o.set.add(i)
      o.set.delete(i)
    }
  }

  function map() {
    const c = component({ map: mapOf(number, number) })
    const o = observe(c)
    for (let i = 0; i < 100000; i++) {
      o.map.set(i, o.map.get(i) ?? i)
      o.map.delete(i)
    }
  }

  console.log(`
  type    | time (ms)
  ------------------------------
  struct  | ${run(simpleStruct)}
  array   | ${run(simpleArray)}
  object  | ${run(simpleObject)}

  type    | time (ms)
  ------------------------------
  set     | ${run(set)}
  map     | ${run(map)}
`)
}
