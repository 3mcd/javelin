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

export type Term = Selector | Component | Relation
export type Spec = Term[]

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

export let normalizeSpec = (spec: Spec) => {
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
        }
        let relation = getRelation(termHi)
        includedComponents.push(relation.relationTag)
      }
      includedComponents.push(term)
    } else if (isRelation(term)) {
      includedComponents.push(term.relationTag as Component)
    } else {
      for (let j = 0; j < term.includedComponents.length; j++) {
        includedComponents.push(term.includedComponents[j])
      }
      for (let j = 0; j < term.excludedComponents.length; j++) {
        excludedComponents.push(term.excludedComponents[j])
      }
    }
  }
  return {includedComponents, excludedComponents}
}

export let hashSpec = (spec: Spec) => {
  let hash = HASH_BASE
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    if (typeof term === "number") {
      hash = hashWord(hash, term)
    } else if (isRelation(term)) {
      hash = hashWord(hash, term.relationTag)
    } else {
      for (let j = 0; j < term.includedComponents.length; j++) {
        hash = hashWord(hash, term.includedComponents[j])
      }
    }
  }
  return normalizeHash(hash)
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
