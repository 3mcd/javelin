import {assert} from "@javelin/lib"
import {HI_MASK, id_hi, id_lo, make_id} from "./entity.js"
import {make_tag, Component, Tag} from "./term.js"

export interface Relation {
  relation_id: number
  relation_term: Component<Tag>
  (to: number | Relation): Component<Tag>
}

let relation_ids = 1
let relations: Relation[] = []

export let make_relation = (): Relation => {
  let relation_id = relation_ids++
  let relation_term = make_tag()
  assert(relation_id <= HI_MASK)
  let relation_attrs = {
    relation_id: relation_id,
    relation_term: relation_term,
  }
  function relate(to: number | Relation) {
    return make_id(
      typeof to === "number" ? id_lo(to) : to.relation_term,
      relation_id,
    ) as Component<void>
  }
  let relation = Object.assign(
    relate,
    relation_attrs,
  ) as unknown as Relation
  relations[relation_id] = relation
  return relation
}

export let get_relation = (relation_id: number) =>
  relations[relation_id]

export let is_relation = (object: object): object is Relation =>
  "relation_id" in object

export let is_relationship = (term: Component) => id_hi(term) > 0

/**
 * Creates a relation pair (entity, relation type) that can be used like a term
 * to create a relationship between two entities.
 * @example <caption>A simple parent-child relationship</caption>
 * let parent = world.make()
 * let child = world.make(type(ChildOf(parent)))
 * @example <caption>Deeply nested children</caption>
 * let a = world.make()
 * let b = world.make(type(ChildOf(a)))
 * let c = world.make(type(ChildOf(b)))
 */
export let ChildOf = make_relation()
export let Without = make_relation()
export let Not = Without
