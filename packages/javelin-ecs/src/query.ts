import {
  exists,
  hashWord,
  HASH_BASE,
  normalizeHash,
  SparseSet,
} from "@javelin/lib"
import {Entity} from "./entity.js"
import {Node} from "./graph.js"
import {Component, ComponentValue, hasSchema} from "./component.js"
import {ComponentsOf, normalizeSpec, Selector, Spec} from "./type.js"
import {isRelation} from "./relation.js"

export type QueryEachIteratee<T extends Spec> = (
  entity: Entity,
  ...values: QueryEachResults<ComponentsOf<T>>
) => void

export type QueryEachIterator<T extends Spec> = (
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
    "S",
    components
      .map((component, i) => `let s${i}=S[${component}];`)
      .join("") +
      "return function eachCompiled(f){" +
      "for(let i=0;i<N.length;i++){" +
      // TODO: make this compatible with property mangling
      "let e=N[i].entities;" +
      "for(let j=e.length-1;j>=0;j--){" +
      "let _=e[j];" +
      "f(_," +
      components.map((_, i) => `s${i}[_]`).join(",") +
      ")" +
      "}" +
      "}" +
      "}",
  )(query.nodes.values(), query.stores) as QueryEachIterator<T>
}

export interface QueryAPI<T extends Spec = Spec> {
  each(iteratee: QueryEachIteratee<T>): void
  as<T extends Spec>(...spec: T): QueryAPI<T>
  size: number
}

export class QueryView<T extends Spec = Spec> implements QueryAPI<T> {
  #query
  #iterator

  constructor(query: Query, components: Component[]) {
    this.#query = query
    this.#iterator = compileEachIterator(
      query,
      components.filter(hasSchema),
    )
  }

  get size() {
    return this.#query.size
  }

  as<T extends Spec>(...spec: T): QueryAPI<T>
  as() {
    return this.#query.as.apply(this.#query, arguments as any)
  }

  each(iteratee: QueryEachIteratee<T>) {
    this.#iterator(iteratee)
  }
}

export class Query<T extends Spec = Spec> implements QueryAPI<T> {
  #selector
  #view
  #views

  readonly nodes
  readonly stores

  constructor(selector: Selector<T>, stores: unknown[][]) {
    this.nodes = new SparseSet<Node>()
    this.stores = stores
    this.#selector = selector
    this.#view = new QueryView(
      this,
      selector.includedComponents,
    ) as QueryView<any>
    this.#views = [] as QueryAPI[]
    this.#views[selector.hash] = this.#view
  }

  includeNode(node: Node) {
    for (
      let i = 0;
      i < this.#selector.excludedComponents.length;
      i++
    ) {
      let term = this.#selector.excludedComponents[i]
      if (node.hasComponent(term)) {
        return
      }
    }
    this.nodes.set(node.type.hash, node)
  }

  excludeNode(node: Node) {
    this.nodes.delete(node.type.hash)
  }

  get size() {
    let size = 0
    let nodes = this.nodes.values()
    for (let i = 0; i < nodes.length; i++) {
      size += nodes[i].entities.length
    }
    return size
  }

  as<T extends Spec>(...spec: T): QueryAPI<T>
  as() {
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
    let view = this.#views[hash]
    if (!exists(view)) {
      let {includedComponents} = normalizeSpec(spec)
      view = new QueryView(this, includedComponents)
      this.#views[hash] = view
    }
    return view
  }

  each(iteratee: QueryEachIteratee<T>) {
    this.#view.each(iteratee)
  }
}
