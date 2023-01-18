import {
  assert,
  HASH_BASE,
  hashWord,
  hashWords,
  normalizeHash,
} from "@javelin/lib"
import {idHi, idLo, LO_MASK} from "./entity.js"
import {
  ChildOf,
  getRelation,
  isRelation,
  Not,
  Relation,
} from "./relation.js"
import {Component} from "./component.js"
import {isSlot} from "./slot.js"

export type Term = Selector | Component | Relation
export type Spec = Term[]

export const ERR_CHILD_OF =
  "A type may have only one ChildOf relationship"
export const ERR_SLOT =
  "A type may have at most one component for a given slot"

export function validateComponents(components: Component[]) {
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

export function normalizeSpec(spec: Spec) {
  let includesChildOfRelation = false
  let includedSlots = new Set<number>()
  let includedComponents: Component[] = []
  let excludedComponents: Component[] = []
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    if (typeof term === "number") {
      if (term > LO_MASK) {
        let termHi = idHi(term)
        if (termHi === Not.relationId) {
          excludedComponents.push(idLo(term) as Component)
          continue
        } else {
          let relation = getRelation(termHi)
          let relationId = relation.relationId
          if (relation === ChildOf) {
            assert(!includesChildOfRelation, ERR_CHILD_OF)
            includesChildOfRelation = true
          } else if (isSlot(relationId)) {
            assert(!includedSlots.has(relationId), ERR_SLOT)
            includedSlots.add(relationId)
          }
          includedComponents.push(relation.relationTag)
        }
      }
      includedComponents.push(term)
    } else if (isRelation(term)) {
      includedComponents.push(term.relationTag as Component)
    } else {
      for (let j = 0; j < term.includedComponents.length; j++) {
        let component = term.includedComponents[j]
        if (component > LO_MASK) {
          let componentHi = idHi(component)
          let relation = getRelation(componentHi)
          let relationId = relation.relationId
          if (relation === ChildOf) {
            assert(!includesChildOfRelation, ERR_CHILD_OF)
            includesChildOfRelation = true
          } else if (isSlot(relationId)) {
            assert(!includedSlots.has(relationId), ERR_SLOT)
            includedSlots.add(relationId)
          }
        }
        includedComponents.push(term.includedComponents[j])
      }
      for (let j = 0; j < term.excludedComponents.length; j++) {
        excludedComponents.push(term.excludedComponents[j])
      }
    }
  }
  return {includedComponents, excludedComponents}
}

export function hashSpec(...querySpec: Spec): number
export function hashSpec() {
  let queryHash = HASH_BASE
  let querySpec = arguments as unknown as Spec
  for (let i = 0; i < querySpec.length; i++) {
    let queryTerm = querySpec[i]
    if (typeof queryTerm === "number") {
      queryHash = hashWord(queryHash, queryTerm)
    } else if (isRelation(queryTerm)) {
      queryHash = hashWord(queryHash, queryTerm.relationTag)
    } else {
      for (let j = 0; j < queryTerm.includedComponents.length; j++) {
        queryHash = hashWord(
          queryHash,
          queryTerm.includedComponents[j],
        )
      }
    }
  }
  return normalizeHash(queryHash)
}

export class Type {
  static cache = [] as Type[]
  static sort = (a: number, b: number) => a - b

  readonly hash
  readonly components

  static of(components: Component[]) {
    components = components.slice().sort(Type.sort)
    let hash = hashWords.apply(null, components)
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
  readonly includedComponents
  readonly excludedComponents

  constructor(spec: T) {
    let {includedComponents, excludedComponents} = normalizeSpec(spec)
    this.hash = hashWords.apply(null, includedComponents)
    this.type = Type.of(includedComponents)
    this.includedComponents = includedComponents
    this.excludedComponents = excludedComponents
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

export function makeSelector<T extends Spec>(
  ...spec: T
): Selector<ComponentsOf<T>>
export function makeSelector() {
  let spec = arguments as unknown as Spec
  let specHash = HASH_BASE
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    if (typeof term === "number") {
      specHash = hashWord(specHash, term)
    } else if (isRelation(term)) {
      specHash = hashWord(specHash, term.relationTag)
    } else {
      for (let j = 0; j < term.includedComponents.length; j++) {
        specHash = hashWord(specHash, term.includedComponents[j])
      }
    }
  }
  specHash = normalizeHash(specHash)
  return (Selector.cache[specHash] ??= new Selector(spec))
}
