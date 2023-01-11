import {assert} from "@javelin/lib"
import {make_relation, Relation} from "./relation.js"
import {Component, get_schema, has_schema, set_schema} from "./term"

let slots = [] as Relation[]

export let is_slot = (component: number) => component in slots

export function slot<T extends Component[]>(...components: T) {
  let slot_relation = make_relation()
  let slot_relationships = [] as number[]
  let slot_components = new Set(components)
  slots[slot_relation.relation_id] = slot_relation
  for (let i = 0; i < components.length; i++) {
    let component = components[i]
    let relationship = slot_relation(component)
    slot_relationships[component] = relationship
    if (has_schema(component)) {
      set_schema(relationship, get_schema(component))
    }
  }
  return Object.assign(<U extends T[number]>(component: U): U => {
    assert(
      slot_components.has(component),
      "A slot only accepts components defined in its enum",
    )
    return slot_relation(component) as U
  }, slot_relation)
}
