import {perf} from "@javelin/perf"
import {Graph} from "./graph.js"
import {makeType, makeTagType} from "./type.js"

let [a, b, c, d, e, f, g, h, i, j, k] = Array.from({length: 11}, makeTagType)

let fixture = () => {
  let graph = new Graph()
  graph.nodeOfType(makeType(b, c, d, e, j))
  graph.nodeOfType(makeType(f, g, h, i, j))
  graph.nodeOfType(makeType(a, b, h, i, j))
  graph.nodeOfType(makeType(a, k))
  graph.nodeOfType(makeType(b, h))
  graph.nodeOfType(makeType(i, j))
  graph.nodeOfType(makeType(d, e, j))
  return {graph}
}

perf("insert isolate", () => {
  let {graph} = fixture()
  return () => {
    graph.nodeOfType(k)
  }
})

perf("insert simple", () => {
  let {graph} = fixture()
  return () => {
    graph.nodeOfType(j)
  }
})

perf("insert complex", () => {
  let {graph} = fixture()
  let T = makeType(a, b, c, d, e, f, g, h, i, j)
  return () => {
    graph.nodeOfType(T)
  }
})

perf("insert simple add", () => {
  let {graph} = fixture()
  let node = graph.nodeOfType(makeType(b, c, d, e, j))
  return () => {
    graph.nodeAddType(node, i)
  }
})

perf("insert complex add", () => {
  let {graph} = fixture()
  let node = graph.nodeOfType(makeType(a, b, c, d, e))
  let T = makeType(f, g, h, i, j)
  return () => {
    graph.nodeAddType(node, T)
  }
})

perf("insert simple rem", () => {
  let {graph} = fixture()
  let node = graph.nodeOfType(makeType(b, c, d, e, j))
  return () => {
    graph.nodeRemoveType(node, b)
  }
})

perf("insert complex rem", () => {
  let {graph} = fixture()
  let node = graph.nodeOfType(makeType(a, b, c, d, e, f, g, h, i))
  let T = makeType(a, c, e, g, i)
  return () => {
    graph.nodeRemoveType(node, T)
  }
})
