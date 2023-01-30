import {perf} from "@javelin/perf"
import {Graph} from "./graph.js"
import {Entity, type, tag} from "./index.js"
import {Transaction} from "./transaction.js"

let [a, b, c, d, e, f, g, h, i, j, k] = Array.from({length: 11}, tag)

let fixture = () => {
  let transaction = new Transaction()
  return {transaction}
}

perf("relocate 1_000 entities", () => {
  let {transaction} = fixture()
  let count = 1_000
  return () => {
    for (let i = 0; i < count; i++) {
      transaction.relocateEntity(i as Entity, 0xffffff, 0xaaaaaa)
    }
  }
})

perf("relocate 1_000 times", () => {
  let {transaction} = fixture()
  let count = 1_000
  let entity = 0 as Entity
  let x = 0xffffff
  let y = 0xaaaaaa
  transaction.relocateEntity(entity, x, y)
  return () => {
    for (let i = 1; i < count + 1; i++) {
      transaction.relocateEntity(entity, x + i, y + i)
    }
  }
})

perf("drain 1_000 entities", () => {
  let {transaction} = fixture()
  let count = 1_000
  let graph = new Graph()
  let types = [
    type(),
    type(a),
    type(a, b, c),
    type(d, e),
    type(e, f, g, h, i, j),
    type(k),
    type(a, b, c, d, e, f, g, h, i, j, k),
    type(a, b),
  ].map(selector => selector.type)
  for (let i = 0; i < types.length; i++) {
    graph.nodeOfType(types[i])
  }
  for (let i = 0; i < count; i++) {
    transaction.relocateEntity(
      i as Entity,
      types[i % types.length].hash,
      types[(i + 1) % types.length].hash,
    )
  }
  return () => {
    transaction.drainEntities(graph, "")
  }
})
