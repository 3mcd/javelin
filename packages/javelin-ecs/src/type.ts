import {
  assert,
  hashWord,
  hashWords,
  HASH_BASE,
  normalizeHash,
} from "@javelin/lib"
import {
  Component,
  getSchema,
  hasSchema,
  makeTagComponent,
  makeValueComponent,
  setSchema,
  Tag,
} from "./component.js"
import {HI_MASK, idHi, idLo, LO_MASK, makeId} from "./entity.js"
import {Schema, SchemaOf} from "./schema.js"

export type QueryTerm = QuerySelector | Component | Relation
export type QueryTerms = QueryTerm[]

export interface Relation {
  relationId: number
  relationTag: Component<Tag>
  (to: number | Relation): QuerySelector<[Component<Tag>]>
}

export const ERR_CHILD_OF = "An entity may have only one ChildOf relationship"
export const ERR_SLOT =
  "An entity may have at most one component for a given slot"
export const ERR_SLOT_DEFINITION =
  "A slot only accepts components defined in its enum"

let slots = [] as Relation[]
let relationIds = 1
let relations: Relation[] = []

export let isSlot = (relationId: number) => relationId in slots

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
  static VOID = new Type([], HASH_BASE)
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
  static VOID = new QuerySelector([])
  static cache = [] as QuerySelector[]

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

export let makeTagSelector = (): QuerySelector<[Component<typeof Tag>]> => {
  let tagComponent = makeTagComponent()
  return new QuerySelector([tagComponent])
}

export function makeValueSelector<T>(
  componentSchema: SchemaOf<T>,
): QuerySelector<[Component<SchemaOf<T>>]>
export function makeValueSelector<T>(): QuerySelector<[Component<T>]>
export function makeValueSelector<T extends Schema>(
  componentSchema: T,
): QuerySelector<[Component<T>]>
export function makeValueSelector() {
  let valueComponent = makeValueComponent.apply(
    null,
    arguments as unknown as [Schema],
  )
  return new QuerySelector([valueComponent])
}

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
export let Not = Object.assign(
  (selector: QuerySelector<[Component]>) => Without(selector.components[0]),
  Without,
)

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
