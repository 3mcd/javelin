import {assert} from "@javelin/lib"
import {makeRelation, Relation} from "./relation.js"
import {Component, getSchema, hasSchema, setSchema} from "./term"

let slots = [] as Relation[]

export let isSlot = (component: number) => component in slots

export function slot<T extends Component[]>(...components: T) {
  let slotRelation = makeRelation()
  let slotRelationships = [] as number[]
  let slotComponents = new Set(components)
  slots[slotRelation.relationId] = slotRelation
  for (let i = 0; i < components.length; i++) {
    let component = components[i]
    let relationship = slotRelation(component)
    slotRelationships[component] = relationship
    if (hasSchema(component)) {
      setSchema(relationship, getSchema(component))
    }
  }
  return Object.assign(<U extends T[number]>(component: U): U => {
    assert(
      slotComponents.has(component),
      "A slot only accepts components defined in its enum",
    )
    return slotRelation(component) as U
  }, slotRelation)
}
