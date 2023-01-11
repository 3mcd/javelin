import {assert, exists, expect, Maybe} from "@javelin/lib"
import {Entity, id_hi, id_lo, LO_MASK, make_id} from "./entity.js"
import {Graph, Node} from "./graph.js"
import {ChildOf} from "./index.js"
import {Monitor} from "./monitor.js"
import {QueryAPI, Query} from "./query.js"
import {resource, Resource} from "./resource.js"
import {Schema, Express} from "./schema.js"
import {System} from "./system.js"
import {
  has_schema,
  Component,
  Tag,
  ComponentValue,
  get_schema,
  express_component,
  Dynamic,
} from "./term.js"
import {Transaction, TransactionIteratee} from "./transaction.js"
import {
  hash_spec,
  normalize_spec,
  Selector,
  Spec,
  Type,
} from "./type.js"

enum Phase {
  Stage = "stage",
  Apply = "apply",
}

export let CurrentSystem = resource<System>()

export type Values<
  T extends Component[],
  U extends unknown[] = [],
> = T extends []
  ? U
  : T extends [infer Head, ...infer Tail]
  ? Tail extends Component[]
    ? Head extends Component<infer Value>
      ? Values<
          Tail,
          Value extends Tag
            ? U
            : [
                ...U,
                Value extends Schema
                  ? Express<Value> | void
                  : unknown extends Value
                  ? unknown
                  : Value,
              ]
        >
      : never
    : never
  : never

export class World {
  #entity_children
  #entity_deltas
  #entity_nodes
  #entity_parents
  #entity_versions
  #free_entity_ids
  #next_entity_id
  #nodes_to_prune
  #resources
  #stores
  #apply_tx
  #stage_tx

  readonly graph

  constructor() {
    this.#stage_tx = new Transaction()
    this.#apply_tx = new Transaction()
    this.#entity_children = [] as Set<Entity>[]
    this.#entity_deltas = [] as unknown[][]
    this.#entity_nodes = [] as Node[]
    this.#entity_parents = [] as Entity[]
    this.#entity_versions = [] as number[]
    this.#free_entity_ids = [] as number[]
    this.#next_entity_id = 0
    this.#nodes_to_prune = new Set<Node>()
    this.#resources = [] as unknown[]
    this.#stores = [] as unknown[][]
    this.graph = new Graph()
  }

  #alloc(): Entity {
    let entity_id: number
    let entity_version: number
    if (this.#free_entity_ids.length > 0) {
      entity_id = this.#free_entity_ids.pop() as number
      entity_version = this.#entity_versions[entity_id]
    } else {
      entity_id = this.#next_entity_id++
      entity_version = this.#entity_versions[entity_id] = 0
      assert(entity_id <= LO_MASK, "too many living entities")
    }
    return make_id(entity_id, entity_version) as Entity
  }

  #free(entity: Entity) {
    let entity_id = id_lo(entity)
    this.#free_entity_ids.push(entity_id)
    this.#entity_versions[entity_id]++
    this.#entity_nodes[entity_id] = undefined!
  }

  #check(entity: Entity) {
    let entity_id = id_lo(entity)
    let entity_version = id_hi(entity)
    assert(
      this.#entity_versions[entity_id] === entity_version,
      `Entity handle ${entity} [${entity_id}] is invalid because it has been deleted`,
    )
    return entity_id
  }

  #set(
    entity: Entity,
    component: Component,
    component_value: unknown,
  ) {
    let store = this.get_store(component)
    store[entity] = component_value
  }

  #unset(entity: Entity, component: Component) {
    let store = this.get_store(component)
    store[entity] = undefined!
  }

  #ensure_children(entity: Entity) {
    let entity_id = id_lo(entity)
    return (this.#entity_children[entity_id] ??= new Set())
  }

  #reparent_entity(child: Entity, parent: Entity) {
    this.#ensure_children(parent).add(child)
    this.#entity_parents[child] = parent
  }

  #unparent_entity(child: Entity, parent: Entity) {
    this.#ensure_children(parent).delete(child)
    this.#entity_parents[child] = undefined!
  }

  #get_entity_node(entity: Entity) {
    return this.#entity_nodes[entity]
  }

  #get_staged_entity_node(entity: Entity) {
    let staged_node_hash = this.#stage_tx.find(entity)
    if (exists(staged_node_hash)) {
      let staged_node = this.graph.find_node(staged_node_hash)
      if (exists(staged_node)) {
        return staged_node
      }
    }
    return this.#entity_nodes[entity]
  }

  #get_entity_version(entity_id: number) {
    return this.#entity_versions[entity_id]
  }

  #commit_make(entity: Entity, next_node: Node) {
    let delta = expect(this.#entity_deltas[entity])
    for (let i = 0; i < next_node.type.components.length; i++) {
      let component = next_node.type.components[i]
      if (has_schema(component)) {
        let component_value = expect(delta[component])
        this.#set(entity, component, component_value)
      } else {
        let hi = id_hi(component)
        if (hi === ChildOf.relation_id) {
          let parent_entity_id = id_lo(component)
          let parent_entity = expect(this.qualify(parent_entity_id))
          this.#reparent_entity(entity, parent_entity)
        }
      }
    }
    next_node.add_entity(entity)
    this.#entity_nodes[entity] = next_node
    this.#entity_deltas[entity] = undefined!
  }

  #commit_update(entity: Entity, next_node: Node) {
    let delta = expect(this.#entity_deltas[entity])
    for (let i = 0; i < next_node.type.components.length; i++) {
      let component = next_node.type.components[i]
      if (has_schema(component)) {
        let component_value = expect(delta[component])
        this.#set(entity, component, component_value)
      }
    }
    this.#entity_deltas[entity] = undefined!
  }

  #commit_destroy(entity: Entity, prev_node: Node) {
    let entity_id = id_lo(entity)
    let entity_children = this.#entity_children[entity_id]
    if (exists(entity_children)) {
      for (let child_entity of entity_children) {
        let child_node = expect(this.#entity_nodes[child_entity])
        this.#commit_destroy(child_entity, child_node)
      }
      entity_children.clear()
    }
    for (let i = 0; i < prev_node.type.components.length; i++) {
      let component = prev_node.type.components[i]
      if (has_schema(component)) {
        this.#unset(entity, component)
      }
    }
    prev_node.remove_entity(entity)
    this.#entity_nodes[entity] = undefined!
    this.#entity_deltas[entity] = undefined!
    this.#entity_parents[entity] = undefined!
    this.#free(entity)
    if (
      prev_node.entities.length === 0 &&
      prev_node.has_any_relationship()
    ) {
      this.#nodes_to_prune.add(prev_node)
    }
  }

  #commit_move(entity: Entity, prev_node: Node, next_node: Node) {
    let delta = expect(this.#entity_deltas[entity])
    for (let i = 0; i < prev_node.type.components.length; i++) {
      let component = prev_node.type.components[i]
      if (!next_node.has_component(component)) {
        if (has_schema(component)) {
          this.#unset(entity, component)
        } else {
          let hi = id_hi(component)
          if (hi === ChildOf.relation_id) {
            let parent_entity_id = id_lo(component)
            let parent_entity = expect(this.qualify(parent_entity_id))
            this.#unparent_entity(entity, parent_entity)
          }
        }
      }
    }
    for (let i = 0; i < next_node.type.components.length; i++) {
      let component = next_node.type.components[i]
      if (has_schema(component)) {
        let component_value = delta?.[component]
        if (exists(component_value)) {
          this.#set(entity, component, component_value)
        }
      } else {
        let hi = id_hi(component)
        if (hi === ChildOf.relation_id) {
          let parent_entity_id = id_lo(component)
          let parent_entity = expect(this.qualify(parent_entity_id))
          this.#reparent_entity(entity, parent_entity)
        }
      }
    }
    this.#entity_nodes[entity] = next_node
    this.#entity_deltas[entity] = undefined!
    next_node.add_entity(entity)
    prev_node.remove_entity(entity)
    if (
      prev_node.entities.length === 0 &&
      prev_node.has_any_relationship()
    ) {
      this.#nodes_to_prune.add(prev_node)
    }
  }

  #update_entity_delta(
    entity: Entity,
    selector: Selector,
    values: unknown[],
  ) {
    let delta = (this.#entity_deltas[entity] ??= [])
    let j = 0
    for (let i = 0; i < selector.included_components.length; i++) {
      let component = selector.included_components[i]
      let component_schema = get_schema(component)
      if (exists(component_schema)) {
        if (component_schema !== Dynamic) {
          delta[component] =
            values[j++] ?? express_component(component)
        } else {
          delta[component] = values[j++]
        }
      }
    }
  }

  #init_query(
    query: Query,
    hash: number,
    node: Node,
    system: System,
  ) {
    function include_existing_node(node: Node) {
      query.include_node(node)
    }
    function include_created_node(node: Node) {
      query.include_node(node)
    }
    function unbind_query_or_exclude_node(node: Node) {
      if (node === node) {
        system.queries.delete(hash)
      } else {
        query.exclude_node(node)
      }
    }
    node.traverse_add(include_existing_node)
    node.on_node_created.add(include_created_node)
    node.on_node_deleted.add(unbind_query_or_exclude_node)
    system.queries.set(hash, query)
  }

  #init_monitor(
    monitor: Monitor,
    hash: number,
    node: Node,
    system: System,
  ) {
    function unbind_monitor(deleted_node: Node) {
      if (node === deleted_node) {
        system.monitors.delete(hash)
      }
    }
    node.on_node_deleted.add(unbind_monitor)
    system.monitors.set(hash, monitor)
  }

  /**
   * Set the value of a resource.
   */
  set_resource<T>(resource: Resource<T>, value: T) {
    this.#resources[resource] = value
  }

  /**
   * Check for the presence of a resource. Returns true if a value has been set
   * for the resource, otherwise returns false.
   */
  has_resource<T>(resource: Resource<T>) {
    return resource in this.#resources
  }

  /**
   * Get the value of a resource. Throws an error if no value has been set for
   * the resource.
   */
  get_resource<T>(resource: Resource<T>) {
    return expect(this.#resources[resource]) as T
  }

  /**
   * Create an entity with a provided id.
   * @private
   */
  reserve(entity_id: number, selector: Selector) {
    let entity = make_id(entity_id, 0) as Entity
    let next_node = this.graph.node_of_type(selector.type)
    this.#entity_versions[entity_id] = 0
    this.#apply_tx.reloc(entity, 0, next_node.type.hash)
    this.#stage_tx.reloc(entity, 0, next_node.type.hash)
    return entity
  }

  /**
   * Upgrade an entity id to a complete entity handle.
   * @private
   */
  qualify(entity_id: number): Maybe<Entity> {
    let entity_gen = this.#get_entity_version(entity_id)
    if (entity_gen === undefined) return
    return make_id(entity_id, entity_gen) as Entity
  }

  /**
   * Create an entity.
   * @example <caption>Create an entity with no data</caption>
   * let entity = make()
   * @example <caption>Create an entity with a type</caption>
   * let Body = type(Position, Velocity)
   * let entity = make(Body)
   */
  create<T extends Component[]>(
    selector: Selector<T>,
    ...values: Values<T>
  ) {
    let entity = this.#alloc()
    let next_node = this.graph.node_of_type(selector.type)
    this.#apply_tx.reloc(entity, 0, next_node.type.hash)
    this.#stage_tx.reloc(entity, 0, next_node.type.hash)
    this.#update_entity_delta(entity, selector, values)
    return entity
  }

  /**
   * Add components to an entity.
   */
  add<T extends Component[]>(
    entity: Entity,
    selector: Selector<T>,
    ...values: Values<T>
  ) {
    this.#check(entity)
    let prev_node = expect(this.#get_staged_entity_node(entity))
    let prev_node_hash = prev_node.type.hash
    let next_node = this.graph.node_add_type(prev_node, selector.type)
    let next_node_hash = next_node.type.hash
    this.#update_entity_delta(entity, selector, values)
    this.#apply_tx.reloc(entity, prev_node_hash, next_node_hash)
    this.#stage_tx.reloc(entity, prev_node_hash, next_node_hash)
  }

  /**
   * Remove components from an entity.
   */
  remove(entity: Entity, selector: Selector) {
    this.#check(entity)
    let prev_node = expect(this.#get_staged_entity_node(entity))
    let prev_node_hash = prev_node.type.hash
    let next_node = this.graph.node_remove_type(
      prev_node,
      selector.type,
    )
    let next_node_hash = next_node.type.hash
    if (prev_node !== next_node) {
      this.#apply_tx.reloc(entity, prev_node_hash, next_node_hash)
      this.#stage_tx.reloc(entity, next_node_hash, next_node_hash)
    }
  }

  /**
   * Destroy an entity.
   * @example
   * let e = make()
   * destroy(e)
   */
  delete(entity: Entity) {
    this.#check(entity)
    let prev_node = expect(this.#get_staged_entity_node(entity))
    let prev_node_hash = prev_node.type.hash
    this.#apply_tx.reloc(entity, prev_node_hash, 0)
    this.#stage_tx.reloc(entity, prev_node_hash, 0)
  }

  /**
   * Get the value of a component for an entity.
   * * If the component is a tag, returns `true` if present, otherwise
   * returns `undefined`
   * * If the component is a component, the component value is returned
   * if present, otherwise returns `undefined`
   * @example
   * let pos = get(e, Position)
   */
  get(entity: Entity, component: Component<Tag>): boolean
  get<T>(entity: Entity, component: Component<T>): ComponentValue<T>
  get(entity: Entity, component: Component) {
    this.#check(entity)
    let node = this.#get_entity_node(entity)
    return node.has_component(component)
      ? !has_schema(component) || this.get_store(component)[entity]
      : undefined
  }

  /**
   * Set the value of a component for an entity. Throws an error if the entity
   * does not have the component.
   */
  set<T>(
    entity: Entity,
    component: Component<T>,
    component_value: ComponentValue<T>,
  ) {
    this.#check(entity)
    let node = this.#get_entity_node(entity)
    assert(node.has_component(component))
    this.#set(entity, component, component_value)
  }

  get_store(component: Component) {
    return (this.#stores[component] ??= [])
  }

  /**
   * Dispatch transient entity modification events.
   * @private
   */
  emit_staged_changes() {
    this.#stage_tx.drain(this.graph, Phase.Stage)
  }

  /**
   * Write entity modifications to the world and dispatch final entity
   * modification events.
   */
  commit_staged_changes() {
    let commit_batch: TransactionIteratee = (
      batch,
      prev_node,
      next_node,
    ) => {
      if (!exists(prev_node)) {
        /* @__PURE__ */ assert(exists(next_node))
        batch.forEach(entity => {
          this.#commit_make(entity, next_node)
        })
      } else if (!exists(next_node)) {
        batch.forEach(entity => {
          this.#commit_destroy(entity, prev_node)
        })
      } else if (next_node === prev_node) {
        batch.forEach(entity => {
          this.#commit_update(entity, next_node)
        })
      } else {
        batch.forEach(entity => {
          /* @__PURE__ */ assert(exists(prev_node))
          /* @__PURE__ */ assert(exists(next_node))
          this.#commit_move(entity, prev_node, next_node)
        })
      }
    }
    this.#apply_tx.drain(this.graph, Phase.Apply, commit_batch)
    this.#nodes_to_prune.forEach(node => {
      if (node.is_empty()) {
        node.traverse_add(node_add =>
          node.traverse_rem(node_rem => {
            node_rem.on_node_deleted.emit(node_add)
            Node.unlink(node_rem, node_add)
          }),
        )
      }
    })
    this.#nodes_to_prune.clear()
  }

  /**
   * Find the parent of an entity.
   * @example <caption>Find the parent of an entity</caption>
   * let parent = world.make()
   * let child = world.make(type(ChildOf(parent)))
   * // world ops are deferred, so next tick:
   * assert(world.parent_of(child) === parent)
   * @example <caption>Find all ancestors of an entity</caption>
   * while (exists(e = world.parent_of(e))) parents.push(e)
   */
  parent_of(entity: Entity) {
    this.#check(entity)
    return this.#entity_parents[entity]
  }

  /**
   * Resolve a query builder for a given set of types, components, and
   * relationships.
   */
  of<T extends Spec>(...spec: T): QueryAPI<T>
  of() {
    let system = this.get_resource(CurrentSystem)
    let spec = arguments as unknown as Spec
    let hash = hash_spec.apply(null, spec)
    let query = system.queries.get(hash)
    if (!exists(query)) {
      let selector = new Selector(spec)
      let stores = get_query_stores(this, selector.type)
      let node = this.graph.node_of_type(selector.type)
      query = new Query(selector, stores)
      this.#init_query(query, hash, node, system)
    }
    return query
  }

  /**
   * Resolve a monitor for a given set of types, components, and relationships.
   * Monitors are updated at the end of the step, after entity modifications
   * are applied to the world.
   */
  monitor(...spec: Spec): Monitor
  monitor() {
    let system = this.get_resource(CurrentSystem)
    let spec = arguments as unknown as Spec
    let hash = hash_spec.apply(null, spec)
    let monitor = system.monitors.get(hash)
    if (!exists(monitor)) {
      let {included_components, excluded_components} =
        normalize_spec(spec)
      let type = Type.of(included_components)
      let node = this.graph.node_of_type(type)
      monitor = new Monitor(node, Phase.Apply, excluded_components)
      this.#init_monitor(monitor, hash, node, system)
    }
    return monitor
  }

  /**
   * Resolve an immediate monitor for a given set of types, components, and
   * relationships. Immediate monitors are updated between systems, before the
   * end of a step, providing the means to intercept excluded component values
   * before they are garbage collected.
   */
  monitor_immediate(...spec: Spec): Monitor
  monitor_immediate() {
    let system = this.get_resource(CurrentSystem)
    let spec = arguments as unknown as Spec
    let hash = hash_spec.apply(null, spec)
    let monitor = system.monitors.get(hash)
    if (!exists(monitor)) {
      let {included_components, excluded_components} =
        normalize_spec(spec)
      let type = Type.of(included_components)
      let node = this.graph.node_of_type(type)
      monitor = new Monitor(node, Phase.Stage, excluded_components)
      this.#init_monitor(monitor, hash, node, system)
    }
    return monitor
  }
}

let get_query_stores = (world: World, type: Type) => {
  let stores = [] as unknown[][]
  for (let i = 0; i < type.components.length; i++) {
    let component = type.components[i]
    if (has_schema(component)) {
      stores[component] = world.get_store(component)
    }
  }
  return stores
}
