import {
  COMPILED_LABEL,
  exists,
  hashWord,
  HASH_BASE,
  normalizeHash,
  SparseSet,
} from "@javelin/lib"
import {Component, Value as ComponentValue, hasSchema} from "./component.js"
import {Entity} from "./entity.js"
import {Node} from "./graph.js"
import {
  ComponentsOf,
  isRelation,
  normalizeQueryTerms,
  Type,
  QueryTerms,
} from "./type.js"

type QueryMask = {
  current: null | Set<Entity>
}

export let _queryMask: QueryMask = {
  current: null,
}

export type QueryEachIteratee<T extends QueryTerms> = (
  entity: Entity,
  ...values: QueryEachResults<ComponentsOf<T>>
) => void

export type QueryEachIterator<T extends QueryTerms> = (
  iteratee: QueryEachIteratee<T>,
) => void

export type QueryEachResults<
  T extends Component[],
  U extends unknown[] = [],
> = T extends []
  ? U
  : T extends [infer Head, ...infer Tail]
  ? Tail extends Component[]
    ? Head extends Component<infer Value>
      ? QueryEachResults<
          Tail,
          ComponentValue<Value> extends never
            ? U
            : [...U, ComponentValue<Value>]
        >
      : never
    : never
  : never

let compileEachIterator = <T extends Component[]>(
  query: Query,
  components: T,
): QueryEachIterator<T> => {
  return Function(
    "N",
    "V",
    "M",
    COMPILED_LABEL +
      components.map((component, i) => `let v${i}=V[${component}];`).join("") +
      "return function eachEntity(f){" +
      "for(let i=0;i<N.length;i++){" +
      "let e=N[i];" +
      "for(let j=e.length-1;j>=0;j--){" +
      "let _=e[j];" +
      "if(M.current!==null&&!M.current.has(_))continue;" +
      "f(_," +
      components.map((_, i) => `v${i}[_]`).join(",") +
      ")" +
      "}" +
      "}" +
      "}",
  )(query.entities.values(), query.stores, _queryMask) as QueryEachIterator<T>
}

export interface QueryAPI<T extends QueryTerms = QueryTerms> {
  each(iteratee: QueryEachIteratee<T>): void
  as<T extends QueryTerms>(...queryTerms: T): QueryAPI<T>
  length: number
}

export class QueryView<T extends QueryTerms = QueryTerms>
  implements QueryAPI<T>
{
  #query

  readonly each: Query<T>["each"]

  constructor(query: Query, components: Component[]) {
    this.#query = query
    this.each = compileEachIterator(query, components.filter(hasSchema))
  }

  get length() {
    return this.#query.length
  }

  as<T extends QueryTerms>(...queryTerms: T): QueryAPI<T>
  as() {
    return this.#query.as.apply(this.#query, arguments as unknown as QueryTerms)
  }
}

export class Query<T extends QueryTerms = QueryTerms> implements QueryAPI<T> {
  #type
  #view
  #views

  readonly entities
  readonly stores

  constructor(type: Type<T>, stores: unknown[][]) {
    this.entities = new SparseSet<Entity[]>()
    this.stores = stores
    this.#type = type
    this.#view = new QueryView(this, type.components) as QueryView<any>
    this.#views = [] as QueryAPI[]
    this.#views[type.hash] = this.#view
  }

  includeNode(node: Node) {
    for (let i = 0; i < this.#type.excludedComponents.length; i++) {
      let term = this.#type.excludedComponents[i]
      if (node.hasComponent(term)) {
        return
      }
    }
    this.entities.set(node.type.hash, node.entities)
  }

  excludeNode(node: Node) {
    this.entities.delete(node.type.hash)
  }

  get length() {
    let size = 0
    let nodes = this.entities.values()
    for (let i = 0; i < nodes.length; i++) {
      size += nodes[i].length
    }
    return size
  }

  as<T extends QueryTerms>(...queryTerms: T): QueryAPI<T>
  as() {
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
    let view = this.#views[queryTermsHash]
    if (!exists(view)) {
      let {components: includedComponents} = normalizeQueryTerms(queryTerms)
      view = new QueryView(this, includedComponents)
      this.#views[queryTermsHash] = view
    }
    return view
  }

  each(iteratee: QueryEachIteratee<T>) {
    this.#view.each(iteratee)
  }
}
