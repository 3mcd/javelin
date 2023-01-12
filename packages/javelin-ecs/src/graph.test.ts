import {Maybe} from "@javelin/lib"
import {suite, test, expect} from "vitest"
import {Graph, Node} from "./graph.js"
import {makeTagComponent} from "./component.js"
import {Type} from "./type.js"

let a = makeTagComponent()
let b = makeTagComponent()
let c = makeTagComponent()

suite("Graph", () => {
  test("node links", () => {
    let graph = new Graph()
    let typeA = Type.of([a])
    let typeBc = Type.of([b, c])
    let typeAbc = Type.of([a, b, c])
    let nodeAbc = graph.nodeOfType(typeAbc)
    let nodeA = graph.nodeOfType(typeA)
    expect(graph.nodeRemoveType(nodeAbc, typeBc)).toBe(nodeA)
    expect(graph.nodeAddType(nodeA, typeBc)).toBe(nodeAbc)
  })
  test("node created event", () => {
    let graph = new Graph()
    let typeAbc = Type.of([a, b, c])
    let typeA = Type.of([a])
    let typeC = Type.of([c])
    let typeBc = Type.of([b, c])
    let nodeA = graph.nodeOfType(typeA)
    let nodeC = graph.nodeOfType(typeC)
    let nodeBc = graph.nodeOfType(typeBc)
    let resA: Maybe<Node>
    let resC: Maybe<Node>
    let resBc: Maybe<Node>
    nodeA.onNodeCreated.add(node => {
      resA = node
    })
    nodeC.onNodeCreated.add(node => {
      resC = node
    })
    nodeBc.onNodeCreated.add(node => {
      resBc = node
    })
    let nodeAbc = graph.nodeOfType(typeAbc)
    expect(resA).toBe(nodeAbc)
    expect(resC).toBe(nodeAbc)
    expect(resBc).toBe(nodeAbc)
  })
})
