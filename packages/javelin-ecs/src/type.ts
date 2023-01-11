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
import {Component} from "./term.js"
import {isSlot} from "./slot.js"

export type Term = Selector | Component | Relation
export type Spec = Term[]

export function normalizeSpec(spec: Spec) {
  let includesChildof = false
  let slots = new Set<number>()
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
            assert(
              !includesChildof,
              "A type may have only one ChildOf relationship",
            )
            includesChildof = true
          } else if (isSlot(relationId)) {
            assert(
              !slots.has(relationId),
              "A type may have at most one component for a given slot",
            )
            slots.add(relationId)
          }
          includedComponents.push(relation.relationTerm)
        }
      }
      includedComponents.push(term)
    } else if (isRelation(term)) {
      includedComponents.push(term.relationTerm as Component)
    } else {
      for (let j = 0; j < term.includedComponents.length; j++) {
        includedComponents.push(term.includedComponents[j])
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
      queryHash = hashWord(queryHash, queryTerm.relationTerm)
    } else {
      for (
        let j = 0;
        j < queryTerm.includedComponents.length;
        j++
      ) {
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
    let {includedComponents, excludedComponents} =
      normalizeSpec(spec)
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
  let hash = HASH_BASE
  let spec = arguments as unknown as Spec
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    if (typeof term === "number") {
      hash = hashWord(hash, term)
    } else if (isRelation(term)) {
      hash = hashWord(hash, term.relationTerm)
    } else {
      for (let j = 0; j < term.includedComponents.length; j++) {
        hash = hashWord(hash, term.includedComponents[j])
      }
    }
  }
  hash = normalizeHash(hash)
  return (Selector.cache[hash] ??= new Selector(spec))
}
