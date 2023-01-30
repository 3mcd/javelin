import {Maybe} from "@javelin/lib"
import {expect, suite, test} from "vitest"
import {Graph, Node} from "./graph.js"
import {
  ChildOf,
  ERR_CHILD_OF,
  ERR_SLOT,
  makeType,
  makeSlot,
  makeTagType,
  NormalizedType,
} from "./type.js"

let [a, b, c] = Array.from({length: 3}, makeTagType)

suite("Graph", () => {
  test("node links", () => {
    let graph = new Graph()
    let nodeABC = graph.nodeOfType(makeType(a, b, c))
    let nodeA = graph.nodeOfType(a)
    expect(graph.nodeRemoveType(nodeABC, makeType(b, c))).toBe(nodeA)
    expect(graph.nodeAddType(nodeA, makeType(b, c))).toBe(nodeABC)
  })
  test("onNodeCreated", () => {
    let graph = new Graph()
    let nodeA = graph.nodeOfType(a)
    let nodeC = graph.nodeOfType(c)
    let nodeBC = graph.nodeOfType(makeType(b, c))
    let resA: Maybe<Node>
    let resC: Maybe<Node>
    let resBC: Maybe<Node>
    nodeA.onNodeCreated.add(node => {
      resA = node
    })
    nodeC.onNodeCreated.add(node => {
      resC = node
    })
    nodeBC.onNodeCreated.add(node => {
      resBC = node
    })
    let nodeABC = graph.nodeOfType(makeType(a, b, c))
    expect(resA).toBe(nodeABC)
    expect(resC).toBe(nodeABC)
    expect(resBC).toBe(nodeABC)
  })
  test("traverseAdd", () => {
    let graph = new Graph()
    let expectedMatches = new Set(
      [b, makeType(b, c), makeType(a, b, c)].map(type => type.normalized),
    )
    let traverseMatches = new Set<NormalizedType>()
    let nodeB = graph.nodeOfType(b)
    graph.nodeOfType(makeType(a, b, c))
    graph.nodeOfType(makeType(a, c))
    graph.nodeOfType(makeType(b, c))
    nodeB.traverseAdd(node => traverseMatches.add(node.type))
    expect(traverseMatches).toEqual(expectedMatches)
  })
  test("traverseRem", () => {
    let graph = new Graph()
    let expectedTypes = [
      a,
      makeType(a, c),
      makeType(b),
      makeType(b, c),
      makeType(a, b),
      makeType(a, b, c),
    ].map(type => type.normalized)
    let expectedMatches = new Set([graph.root.type, ...expectedTypes])
    let traverseMatches = new Set<NormalizedType>()
    let nodeABC = graph.nodeOfType(makeType(a, b, c))
    graph.nodeOfType(b)
    graph.nodeOfType(makeType(a, c))
    graph.nodeOfType(makeType(b, c))
    nodeABC.traverseRem(node => traverseMatches.add(node.type))
    expect(traverseMatches).toEqual(expectedMatches)
  })
  test("ChildOf validation", () => {
    let graph = new Graph()
    let childOf0 = ChildOf(0)
    let childOf1 = ChildOf(1)
    let node = graph.nodeOfType(childOf0)
    expect(() => graph.nodeAddType(node, childOf1)).toThrow(ERR_CHILD_OF)
  })
  test("slot validation", () => {
    let graph = new Graph()
    let aOrB = makeSlot(a, b)
    let node = graph.nodeOfType(aOrB(a))
    expect(() => graph.nodeAddType(node, aOrB(b))).toThrow(ERR_SLOT)
  })
})
