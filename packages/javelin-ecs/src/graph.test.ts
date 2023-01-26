import {Maybe} from "@javelin/lib"
import {suite, test, expect} from "vitest"
import {Graph, Node} from "./graph.js"
import {makeTagComponent} from "./component.js"
import {ERR_CHILD_OF, ERR_SLOT, makeSelector, Type} from "./type.js"
import {ChildOf} from "./relation.js"
import {makeSlot} from "./slot.js"

let a = makeTagComponent()
let b = makeTagComponent()
let c = makeTagComponent()

suite("Graph", () => {
  test("node links", () => {
    let graph = new Graph()
    let A = Type.of([a])
    let BC = Type.of([b, c])
    let ABC = Type.of([a, b, c])
    let nodeABC = graph.nodeOfType(ABC)
    let nodeA = graph.nodeOfType(A)
    expect(graph.nodeRemoveType(nodeABC, BC)).toBe(nodeA)
    expect(graph.nodeAddType(nodeA, BC)).toBe(nodeABC)
  })
  test("node created event", () => {
    let graph = new Graph()
    let ABC = Type.of([a, b, c])
    let A = Type.of([a])
    let C = Type.of([c])
    let BC = Type.of([b, c])
    let nodeA = graph.nodeOfType(A)
    let nodeC = graph.nodeOfType(C)
    let nodeBC = graph.nodeOfType(BC)
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
    let nodeABC = graph.nodeOfType(ABC)
    expect(resA).toBe(nodeABC)
    expect(resC).toBe(nodeABC)
    expect(resBC).toBe(nodeABC)
  })
  test("traverseAdd", () => {
    let graph = new Graph()
    let AC = Type.of([a, c])
    let ABC = Type.of([a, b, c])
    let B = Type.of([b])
    let BC = Type.of([b, c])
    let expectedMatches = new Set([B, BC, ABC])
    let traverseMatches = new Set<Type>()
    let nodeB = graph.nodeOfType(B)
    graph.nodeOfType(ABC)
    graph.nodeOfType(AC)
    graph.nodeOfType(BC)
    nodeB.traverseAdd(node => traverseMatches.add(node.type))
    expect(traverseMatches).toEqual(expectedMatches)
  })
  test("traverseRem", () => {
    let graph = new Graph()
    let A = Type.of([a])
    let AB = Type.of([a, b])
    let AC = Type.of([a, c])
    let ABC = Type.of([a, b, c])
    let B = Type.of([b])
    let BC = Type.of([b, c])
    let expectedTypes = [A, AC, B, BC, AB, ABC]
    let expectedMatches = new Set([graph.root.type, ...expectedTypes])
    let traverseMatches = new Set<Type>()
    let nodeABC = graph.nodeOfType(ABC)
    graph.nodeOfType(B)
    graph.nodeOfType(AC)
    graph.nodeOfType(BC)
    nodeABC.traverseRem(node => traverseMatches.add(node.type))
    expect(traverseMatches).toEqual(expectedMatches)
  })
  test("ChildOf validation", () => {
    let graph = new Graph()
    let ChildOf0 = ChildOf(0)
    let ChildOf1 = ChildOf(1)
    let node = graph.nodeOfType(ChildOf0.type)
    expect(() => graph.nodeAddType(node, ChildOf1.type)).toThrow(ERR_CHILD_OF)
  })
  test("slot validation", () => {
    let graph = new Graph()
    let A = makeSelector(a)
    let B = makeSelector(b)
    let AorB = makeSlot(A, B)
    let node = graph.nodeOfType(AorB(A).type)
    expect(() => graph.nodeAddType(node, AorB(B).type)).toThrow(ERR_SLOT)
  })
})
