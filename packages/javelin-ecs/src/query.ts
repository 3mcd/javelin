import {exists, SparseSet} from "@javelin/lib"
import {Entity} from "./entity.js"
import {Node} from "./graph.js"
import {Component, ComponentValue, has_schema} from "./term.js"
import {ComponentsOf, hash_spec, Selector, Spec} from "./type.js"

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

let compile_each_iterator = <T extends Component[]>(
  query: Query,
  components: T,
): QueryEachIterator<T> => {
  return Function(
    "N",
    "S",
    components
      .map((component, i) => `let s${i}=S[${component}];`)
      .join("") +
      "return function each_compiled(f){" +
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
  as<T extends Component[]>(...components: T): QueryAPI<T>
  size: number
}

export class QueryView<T extends Spec = Spec> implements QueryAPI<T> {
  #query
  #iterator

  constructor(query: Query, components: Component[]) {
    this.#query = query
    this.#iterator = compile_each_iterator(
      query,
      components.filter(has_schema),
    )
  }

  get size() {
    return this.#query.size
  }

  as<T extends Component[]>(...components: T): QueryAPI<T>
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
      selector.included_components,
    ) as QueryView<any>
    this.#views = [] as QueryAPI[]
    this.#views[selector.hash] = this.#view
  }

  include_node(node: Node) {
    for (
      let i = 0;
      i < this.#selector.excluded_components.length;
      i++
    ) {
      let term = this.#selector.excluded_components[i]
      if (node.has_component(term)) {
        return
      }
    }
    this.nodes.set(node.type.hash, node)
  }

  exclude_node(node: Node) {
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

  as<T extends Component[]>(...components: T): QueryAPI<T>
  as() {
    let components = arguments as unknown as Component[]
    let hash = hash_spec.apply(null, components)
    let view = this.#views[hash]
    if (!exists(view)) {
      view = new QueryView(this, Array.from(components))
      this.#views[hash] = view
    }
    return view
  }

  each(iteratee: QueryEachIteratee<T>) {
    this.#view.each(iteratee)
  }
}
