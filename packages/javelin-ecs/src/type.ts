import {
  assert,
  HASH_BASE,
  hashWord,
  hashWords,
  normalizeHash,
} from "@javelin/lib"
import {idHi, idLo, LO_MASK} from "./entity.js"
import {ChildOf, getRelation, isRelation, Not, Relation} from "./relation.js"
import {Component} from "./component.js"
import {isSlot} from "./slot.js"

export type QueryTerm = QuerySelector | Component | Relation
export type QueryTerms = QueryTerm[]

export const ERR_CHILD_OF = "An entity may have only one ChildOf relationship"
export const ERR_SLOT =
  "An entity may have at most one component for a given slot"

export let validateComponents = (components: Component[]) => {
  let includesChildOfRelation = false
  let includedSlots = new Set<number>()
  for (let i = 0; i < components.length; i++) {
    let component = components[i]
    if (component > LO_MASK) {
      let relationId = idHi(component)
      if (relationId === ChildOf.relationId) {
        assert(!includesChildOfRelation, ERR_CHILD_OF)
        includesChildOfRelation = true
      } else if (isSlot(relationId)) {
        assert(!includedSlots.has(relationId), ERR_SLOT)
        includedSlots.add(relationId)
      }
    }
  }
}

export let normalizeQueryTerms = (queryTerms: QueryTerms) => {
  let components: Component[] = []
  let excludedComponents: Component[] = []
  for (let i = 0; i < queryTerms.length; i++) {
    let queryTerm = queryTerms[i]
    if (typeof queryTerm === "number") {
      if (queryTerm > LO_MASK) {
        let termHi = idHi(queryTerm)
        if (termHi === Not.relationId) {
          excludedComponents.push(idLo(queryTerm) as Component)
          continue
        }
        let relation = getRelation(termHi)
        components.push(relation.relationTag)
      }
      components.push(queryTerm)
    } else if (isRelation(queryTerm)) {
      components.push(queryTerm.relationTag as Component)
    } else {
      for (let j = 0; j < queryTerm.components.length; j++) {
        components.push(queryTerm.components[j])
      }
      for (let j = 0; j < queryTerm.excludedComponents.length; j++) {
        excludedComponents.push(queryTerm.excludedComponents[j])
      }
    }
  }
  return {components, excludedComponents}
}

export let hashQueryTerms = (queryTerms: QueryTerms) => {
  let queryTermsHash = HASH_BASE
  for (let i = 0; i < queryTerms.length; i++) {
    let queryTerm = queryTerms[i]
    if (typeof queryTerm === "number") {
      queryTermsHash = hashWord(queryTermsHash, queryTerm)
    } else if (isRelation(queryTerm)) {
      queryTermsHash = hashWord(queryTermsHash, queryTerm.relationTag)
    } else {
      for (let j = 0; j < queryTerm.components.length; j++) {
        queryTermsHash = hashWord(queryTermsHash, queryTerm.components[j])
      }
    }
  }
  return normalizeHash(queryTermsHash)
}

export class Type {
  static cache = [] as Type[]
  static sort = (a: number, b: number) => a - b

  readonly hash
  readonly components

  static fromComponents(components: Component[]) {
    components = components.slice().sort(Type.sort)
    let hash = hashWords.apply(null, components)
    return (Type.cache[hash] ??= new Type(components, hash))
  }

  private constructor(components: Component[], hash: number) {
    this.components = components
    this.hash = hash
  }
}

export class QuerySelector<T extends QueryTerms = QueryTerms> {
  static cache = [] as QuerySelector[]
  static VOID = new QuerySelector([])

  readonly hash
  readonly type
  readonly components
  readonly excludedComponents

  constructor(queryTerms: T) {
    let {components, excludedComponents} = normalizeQueryTerms(queryTerms)
    this.hash = hashWords.apply(null, components)
    this.type = Type.fromComponents(components)
    this.components = components
    this.excludedComponents = excludedComponents
  }
}

export type ComponentsOf<
  T extends QueryTerms,
  U extends Component[] = [],
> = T extends []
  ? U
  : T extends [infer Head, ...infer Tail]
  ? Tail extends QueryTerms
    ? Head extends Component
      ? ComponentsOf<Tail, [...U, Head]>
      : Head extends QuerySelector<infer QT>
      ? ComponentsOf<Tail, [...U, ...ComponentsOf<QT>]>
      : never
    : never
  : never

export function makeQuerySelector<T extends QueryTerms>(
  ...queryTerms: T
): QuerySelector<ComponentsOf<T>>
export function makeQuerySelector() {
  let queryTerms = arguments as unknown as QueryTerms
  let queryTermsHash = HASH_BASE
  for (let i = 0; i < queryTerms.length; i++) {
    let queryTerm = queryTerms[i]
    if (typeof queryTerm === "number") {
      queryTermsHash = hashWord(queryTermsHash, queryTerm)
    } else if (isRelation(queryTerm)) {
      queryTermsHash = hashWord(queryTermsHash, queryTerm.relationTag)
    } else {
      for (let j = 0; j < queryTerm.components.length; j++) {
        queryTermsHash = hashWord(queryTermsHash, queryTerm.components[j])
      }
    }
  }
  queryTermsHash = normalizeHash(queryTermsHash)
  return (QuerySelector.cache[queryTermsHash] ??= new QuerySelector(queryTerms))
}
