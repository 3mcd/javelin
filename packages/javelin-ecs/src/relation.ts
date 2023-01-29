import {assert} from "@javelin/lib"
import {HI_MASK, idHi, idLo, makeId} from "./entity.js"
import {makeTagComponent, Component, Tag} from "./component.js"
import {makeQuerySelector, QuerySelector} from "./type.js"

export interface Relation {
  relationId: number
  relationTag: Component<Tag>
  (to: number | Relation): QuerySelector<[Component<Tag>]>
}

let relationIds = 1
let relations: Relation[] = []

export let makeRelation = (): Relation => {
  let relationId = relationIds++
  let relationTag = makeTagComponent()
  assert(relationId <= HI_MASK)
  let relationAttrs = {relationId, relationTag}
  let makeRelationship = (to: number | Relation) => {
    return makeQuerySelector(
      makeId(
        typeof to === "number" ? idLo(to) : to.relationTag,
        relationId,
      ) as Component<void>,
    )
  }
  let relation = Object.assign(
    makeRelationship,
    relationAttrs,
  ) as unknown as Relation
  relations[relationId] = relation
  return relation
}

export let getRelation = (relationId: number) => relations[relationId]

export let isRelation = (object: object): object is Relation =>
  "relation_id" in object

export let isRelationship = (term: Component) => idHi(term) > 0

/**
 * Creates a relation pair (entity, relation type) that can be used like a term
 * to create a relationship between two entities.
 * @example <caption>A simple parent-child relationship</caption>
 * let parent = world.make()
 * let child = world.make(ChildOf(parent))
 * @example <caption>Deeply nested children</caption>
 * let a = world.make()
 * let b = world.make(ChildOf(a))
 * let c = world.make(ChildOf(b))
 */
export let ChildOf = makeRelation()
let Without = makeRelation()
export let Not = (selector: QuerySelector<[Component]>) => {
  return Without(selector.components[0])
}
