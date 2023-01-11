import {Maybe} from "@javelin/lib"
import {suite, test, expect} from "vitest"
import {Graph, Node} from "./graph.js"
import {make_tag} from "./term.js"
import {Type} from "./type.js"

let a = make_tag()
let b = make_tag()
let c = make_tag()

suite("Graph", () => {
  test("node links", () => {
    let graph = new Graph()
    let type_a = Type.of([a])
    let type_bc = Type.of([b, c])
    let type_abc = Type.of([a, b, c])
    let node_abc = graph.node_of_type(type_abc)
    let node_a = graph.node_of_type(type_a)
    expect(graph.node_remove_type(node_abc, type_bc)).toBe(node_a)
    expect(graph.node_add_type(node_a, type_bc)).toBe(node_abc)
  })
  test("node created event", () => {
    let graph = new Graph()
    let type_abc = Type.of([a, b, c])
    let type_a = Type.of([a])
    let type_c = Type.of([c])
    let type_bc = Type.of([b, c])
    let node_a = graph.node_of_type(type_a)
    let node_c = graph.node_of_type(type_c)
    let node_bc = graph.node_of_type(type_bc)
    let res_a: Maybe<Node>
    let res_c: Maybe<Node>
    let res_bc: Maybe<Node>
    node_a.on_node_created.add(node => {
      res_a = node
    })
    node_c.on_node_created.add(node => {
      res_c = node
    })
    node_bc.on_node_created.add(node => {
      res_bc = node
    })
    let node_abc = graph.node_of_type(type_abc)
    expect(res_a).toBe(node_abc)
    expect(res_c).toBe(node_abc)
    expect(res_bc).toBe(node_abc)
  })
})
