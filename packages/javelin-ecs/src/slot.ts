import {assert} from "@javelin/lib"
import {makeRelation, Relation} from "./relation.js"
import {Component, getSchema, hasSchema, setSchema} from "./component"
import {Selector} from "./type.js"

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
    if (hasSchema(termComponent)) {
      setSchema(
        relationship.includedComponents[0],
        getSchema(termComponent),
      )
    }
  }
  function makeSlotComponent<U extends T[number]>(component: U) {
    assert(
      slotComponents.has(component),
      "A slot only accepts components defined in its enum",
    )
    return slotRelation(component.includedComponents[0]) as U
  }
  return Object.assign(makeSlotComponent, slotRelation)
}
