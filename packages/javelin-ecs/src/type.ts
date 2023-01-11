import {
  assert,
  HASH_BASE,
  hash_word,
  hash_words,
  normalize_hash,
} from "@javelin/lib"
import {id_hi, id_lo, LO_MASK} from "./entity.js"
import {
  ChildOf,
  get_relation,
  is_relation,
  Not,
  Relation,
} from "./relation.js"
import {Component} from "./term.js"
import {is_slot} from "./slot.js"

export type Term = Selector | Component | Relation
export type Spec = Term[]

export function normalize_spec(spec: Spec) {
  let includes_childof = false
  let slots = new Set<number>()
  let included_components: Component[] = []
  let excluded_components: Component[] = []
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    if (typeof term === "number") {
      if (term > LO_MASK) {
        let term_hi = id_hi(term)
        if (term_hi === Not.relation_id) {
          excluded_components.push(id_lo(term) as Component)
          continue
        } else {
          let relation = get_relation(term_hi)
          let relation_id = relation.relation_id
          if (relation === ChildOf) {
            assert(
              !includes_childof,
              "A type may have only one ChildOf relationship",
            )
            includes_childof = true
          } else if (is_slot(relation_id)) {
            assert(
              !slots.has(relation_id),
              "A type may have at most one component for a given slot",
            )
            slots.add(relation_id)
          }
          included_components.push(relation.relation_term)
        }
      }
      included_components.push(term)
    } else if (is_relation(term)) {
      included_components.push(term.relation_term as Component)
    } else {
      for (let j = 0; j < term.included_components.length; j++) {
        included_components.push(term.included_components[j])
      }
    }
  }
  return {included_components, excluded_components}
}

export function hash_spec(...query_spec: Spec): number
export function hash_spec() {
  let query_hash = HASH_BASE
  let query_spec = arguments as unknown as Spec
  for (let i = 0; i < query_spec.length; i++) {
    let query_term = query_spec[i]
    if (typeof query_term === "number") {
      query_hash = hash_word(query_hash, query_term)
    } else if (is_relation(query_term)) {
      query_hash = hash_word(query_hash, query_term.relation_term)
    } else {
      for (
        let j = 0;
        j < query_term.included_components.length;
        j++
      ) {
        query_hash = hash_word(
          query_hash,
          query_term.included_components[j],
        )
      }
    }
  }
  return normalize_hash(query_hash)
}

export class Type {
  static cache = [] as Type[]
  static sort = (a: number, b: number) => a - b

  readonly hash
  readonly components

  static of(components: Component[]) {
    components = components.slice().sort(Type.sort)
    let hash = hash_words.apply(null, components)
    return (Type.cache[hash] ??= new Type(components, hash))
  }

  private constructor(components: Component[], hash: number) {
    this.components = components
    this.hash = hash
  }
}

export class Selector<T extends Spec = Spec> {
  static cache = [] as Selector[]
  static VOID = new Selector([])

  readonly hash
  readonly type
  readonly included_components
  readonly excluded_components

  constructor(spec: T) {
    let {included_components, excluded_components} =
      normalize_spec(spec)
    this.hash = hash_words.apply(null, included_components)
    this.type = Type.of(included_components)
    this.included_components = included_components
    this.excluded_components = excluded_components
  }
}

export type ComponentsOf<
  T extends Spec,
  U extends Component[] = [],
> = T extends []
  ? U
  : T extends [infer Head, ...infer Tail]
  ? Tail extends Spec
    ? Head extends Component
      ? ComponentsOf<Tail, [...U, Head]>
      : Head extends Selector<infer Spec>
      ? ComponentsOf<Tail, [...U, ...ComponentsOf<Spec>]>
      : never
    : never
  : never

export function make_selector<T extends Spec>(
  ...spec: T
): Selector<ComponentsOf<T>>
export function make_selector() {
  let hash = HASH_BASE
  let spec = arguments as unknown as Spec
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    if (typeof term === "number") {
      hash = hash_word(hash, term)
    } else if (is_relation(term)) {
      hash = hash_word(hash, term.relation_term)
    } else {
      for (let j = 0; j < term.included_components.length; j++) {
        hash = hash_word(hash, term.included_components[j])
      }
    }
  }
  hash = normalize_hash(hash)
  return (Selector.cache[hash] ??= new Selector(spec))
}
