import {assert} from "@javelin/lib"
import {makeRelation, Relation} from "./relation.js"
import {
  Component,
  get_schema,
  has_schema,
  set_schema,
} from "./component"
import {Selector} from "./type.js"

export const ERR_SLOT_DEFINITION =
  "A slot only accepts components defined in its enum"

let slots = [] as Relation[]

export let isSlot = (relationId: number) => relationId in slots

export function makeSlot<T extends Selector<[Component]>[]>(
  ...spec: T
) {
  let slotRelation = makeRelation()
  let slotRelationships = [] as Selector<[Component]>[]
  let slotComponents = new Set(spec)
  slots[slotRelation.relationId] = slotRelation
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    let termComponent = term.includedComponents[0]
    let relationship = slotRelation(termComponent)
    slotRelationships[termComponent] = relationship
    if (has_schema(termComponent)) {
      set_schema(
        relationship.includedComponents[0],
        get_schema(termComponent),
      )
    }
  }
  function makeSlotComponent<U extends T[number]>(component: U) {
    assert(slotComponents.has(component), ERR_SLOT_DEFINITION)
    return slotRelation(component.includedComponents[0]) as U
  }
  return Object.assign(makeSlotComponent, slotRelation)
}
