import {assert} from "@javelin/lib"
import {makeRelation, Relation} from "./relation.js"
import {Component, getSchema, hasSchema, setSchema} from "./component"
import {QuerySelector} from "./type.js"

export const ERR_SLOT_DEFINITION =
  "A slot only accepts components defined in its enum"

let slots = [] as Relation[]

export let isSlot = (relationId: number) => relationId in slots

export let makeSlot = <T extends QuerySelector<[Component]>[]>(
  ...componentSelectors: T
) => {
  let slotRelation = makeRelation()
  let slotRelationships = [] as QuerySelector<[Component]>[]
  let slotComponents = new Set(componentSelectors)
  slots[slotRelation.relationId] = slotRelation
  for (let i = 0; i < componentSelectors.length; i++) {
    let componentSelector = componentSelectors[i]
    let component = componentSelector.components[0]
    let componentRelationship = slotRelation(component)
    slotRelationships[component] = componentRelationship
    if (hasSchema(component)) {
      setSchema(componentRelationship.components[0], getSchema(component))
    }
  }
  let makeSlotComponent = <U extends T[number]>(component: U) => {
    assert(slotComponents.has(component), ERR_SLOT_DEFINITION)
    return slotRelation(component.components[0]) as U
  }
  return Object.assign(makeSlotComponent, slotRelation)
}
