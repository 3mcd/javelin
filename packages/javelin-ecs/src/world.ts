import {assert, exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {
  Component,
  ValuesInit,
  Value,
  express,
  getSchema,
  hasSchema,
  Tag,
  _dynamic,
} from "./component.js"
import {Entity, idHi, idLo, LO_MASK, makeId} from "./entity.js"
import {Graph, Node} from "./graph.js"
import {ChildOf} from "./index.js"
import {Monitor} from "./monitor.js"
import {Query, QueryAPI} from "./query.js"
import {makeResource, Resource} from "./resource.js"
import {System} from "./system.js"
import {Transaction, TransactionIteratee} from "./transaction.js"
import {hashQueryTerms, QueryTerms, Singleton, Type} from "./type.js"

const makeEntityLabel = (entity: Entity, entityId = idLo(entity)) =>
  `entity ${entity} (${entityId})`

const ERR_AT_ENTITY_CAP = `Failed to allocate entity id: surpassed the limit of ${LO_MASK.toLocaleString()} living entities`
const ERR_MISSING_COMPONENT = (entity: Entity) =>
  `Failed to get component for entity: you may have tried to read or write a component value before ${makeEntityLabel(
    entity,
  )} was initialized`
const ERR_EXPECTED_VALUE_COMPONENT = (component: Component) =>
  `Failed to get component value array: component with id ${component} is not a value component`
const ERR_INVALID_ENTITY_VERSION = (entity: Entity, entityId: number) =>
  `Failed to validate entity: ${makeEntityLabel(
    entity,
    entityId,
  )} is invalid—has it been deleted?`
const ERR_EXPECTED_ENTITY_HAS_COMPONENT = (
  entity: Entity,
  component: Component,
) =>
  `Failed to update component value: ${makeEntityLabel(
    entity,
  )} does not have component with id ${component}`
const ERR_PARENT_INVALID = (entity: Entity) =>
  `Failed to reparent entity: you may have tried to add a ChildOf relationship between ${makeEntityLabel(
    entity,
  )} and an invalid entity—has the parent been deleted?`

/**
 * @private
 */
export const _hasComponent = Symbol()
/**
 * @private
 */
export const _getComponentStore = Symbol()
/**
 * @private
 */
export const _emitStagedChanges = Symbol()
/**
 * @private
 */
export const _commitStagedChanges = Symbol()
/**
 * @private
 */
export const _qualifyEntity = Symbol()
/**
 * @private
 */
export const _reserveEntity = Symbol()
/**
 * @private
 */
export const _commandQueues = Symbol()
/**
 * @private
 */
export const _drainCommands = Symbol()

export enum Phase {
  Stage = "stage",
  Apply = "apply",
}

export let CurrentSystem = makeResource<System>()

export class World {
  readonly #applyTransaction
  readonly #commandQueues
  readonly #componentStores
  readonly #disposableNodes
  readonly #entityChildren
  readonly #entityIdVersions
  readonly #entityDeltas
  readonly #entityNodes
  readonly #entityParents
  readonly #freeEntityIds
  readonly #resources
  readonly #stageTransaction
  #nextEntityId

  readonly graph

  constructor() {
    this.#applyTransaction = new Transaction()
    this.#commandQueues = new SparseSet<unknown[]>()
    this.#componentStores = [] as unknown[][]
    this.#disposableNodes = new Set<Node>()
    this.#entityChildren = [] as Set<Entity>[]
    this.#entityDeltas = [] as unknown[][]
    this.#entityIdVersions = [] as number[]
    this.#entityNodes = [] as Node[]
    this.#entityParents = [] as Entity[]
    this.#freeEntityIds = [] as number[]
    this.#nextEntityId = 0
    this.#resources = [] as unknown[]
    this.#stageTransaction = new Transaction()
    this.graph = new Graph()
    this.setResource(CurrentSystem, new System(() => {}))
  }

  #ensureCommandQueue(command: Singleton) {
    let commandComponent = command.components[0]
    let commandQueue = this.#commandQueues.get(commandComponent)
    if (!exists(commandQueue)) {
      commandQueue = []
      this.#commandQueues.set(commandComponent, commandQueue)
    }
    return commandQueue
  }

  #allocEntityId(): Entity {
    let entityId: number
    let entityVersion: number
    if (this.#freeEntityIds.length > 0) {
      entityId = this.#freeEntityIds.pop() as number
      entityVersion = this.#entityIdVersions[entityId]
    } else {
      while (exists(this.#entityIdVersions[this.#nextEntityId])) {
        this.#nextEntityId++
      }
      entityId = this.#nextEntityId
      entityVersion = this.#entityIdVersions[entityId] = 0
      assert(entityId <= LO_MASK, ERR_AT_ENTITY_CAP)
    }
    return makeId(entityId, entityVersion) as Entity
  }

  #freeEntityId(entity: Entity): void {
    let entityId = idLo(entity)
    this.#freeEntityIds.push(entityId)
  }

  #validateEntityVersion(entity: Entity): number {
    let entityId = idLo(entity)
    let entityIdVersion = idHi(entity)
    assert(
      this.#entityIdVersions[entityId] === entityIdVersion,
      ERR_INVALID_ENTITY_VERSION(entity, entityId),
    )
    return entityId
  }

  #getEntityIdVersion(entityId: number): Maybe<number> {
    return this.#entityIdVersions[entityId]
  }

  #incrementEntityIdVersion(entityId: number): void {
    let entityVersion = this.#entityIdVersions[entityId]
    this.#entityIdVersions[entityId] = exists(entityVersion)
      ? entityVersion + 1
      : 0
  }

  #setEntityComponentValue(
    entity: Entity,
    component: Component,
    componentValue: unknown,
  ): void {
    let componentStore = this[_getComponentStore](component)
    componentStore[entity] = componentValue
  }

  #freeEntityComponentValue(entity: Entity, component: Component): void {
    let componentStore = this[_getComponentStore](component)
    componentStore[entity] = undefined!
  }

  #ensureEntityDelta(entity: Entity): unknown[] {
    return (this.#entityDeltas[idLo(entity)] ??= [])
  }

  #freeEntityDelta(entity: Entity): void {
    this.#entityDeltas[entity] = undefined!
  }

  #ensureEntityChildren(entity: Entity): Set<Entity> {
    return (this.#entityChildren[entity] ??= new Set())
  }

  #setEntityParent(entity: Entity, entityParent: Entity): void {
    this.#ensureEntityChildren(entityParent).add(entity)
    this.#entityParents[entity] = entityParent
  }

  #freeEntityParent(entity: Entity): void {
    let entityParent = this.parentOf(entity)
    if (exists(entityParent)) {
      this.#ensureEntityChildren(entityParent).delete(entity)
      this.#entityParents[entity] = undefined!
    }
  }

  #getEntityNode(entity: Entity): Maybe<Node> {
    return this.#entityNodes[entity]
  }

  #setEntityNode(entity: Entity, node: Node): void {
    this.#entityNodes[entity] = node
  }

  #freeEntityNode(entity: Entity): void {
    this.#entityNodes[entity] = undefined!
  }

  #getStagedEntityNode(entity: Entity): Maybe<Node> {
    // First check if the entity has already been relocated during the step.
    let stagedNodeHash = this.#applyTransaction.locateEntity(entity)
    if (exists(stagedNodeHash)) {
      // If the entity has been deleted, it has no staged node.
      if (stagedNodeHash === 0) {
        return undefined
      }
      return expect(this.graph.findNode(stagedNodeHash))
    }
    // Fall back to the entity's true location in the archetype graph.
    return this.#entityNodes[entity]
  }

  #relocateEntity(entity: Entity, prevNode?: Node, nextNode?: Node): void {
    let prevHash = prevNode?.type.hash ?? 0
    let nextHash = nextNode?.type.hash ?? 0
    // Update both stage and apply transactions. The stage transaction is
    // drained after each system, while the apply transaction is drained after
    // each step.
    this.#stageTransaction.relocateEntity(entity, prevHash, nextHash)
    this.#applyTransaction.relocateEntity(entity, prevHash, nextHash)
  }

  #commitMake(entity: Entity, nextNode: Node): void {
    let entityDelta = this.#ensureEntityDelta(entity)
    for (let i = 0; i < nextNode.type.components.length; i++) {
      let component = nextNode.type.components[i]
      if (hasSchema(component)) {
        // Insert the new entity's component values into their respective
        // component stores.
        let componentValue = expect(entityDelta[component])
        this.#setEntityComponentValue(entity, component, componentValue)
      } else {
        let componentHi = idHi(component)
        // Attach the new entity to its parent component if it was defined
        // with one.
        if (componentHi === ChildOf.relationId) {
          let parentEntityId = idLo(component)
          let parentEntity = expect(this[_qualifyEntity](parentEntityId))
          this.#setEntityParent(entity, parentEntity)
        }
      }
    }
    // Insert the new entity into its archetype.
    nextNode.addEntity(entity)
    this.#setEntityNode(entity, nextNode)
    // Free the new entity's component change set.
    this.#freeEntityDelta(entity)
  }

  #commitUpdate(entity: Entity, nextNode: Node): void {
    let entityDelta = this.#ensureEntityDelta(entity)
    // Overwrite the updated entity's existing component values in their
    // respective component stores.
    for (let i = 0; i < nextNode.type.components.length; i++) {
      let component = nextNode.type.components[i]
      if (hasSchema(component)) {
        let componentValue = expect(entityDelta[component])
        this.#setEntityComponentValue(entity, component, componentValue)
      }
    }
    this.#setEntityNode(entity, nextNode)
    // Free the new entity's component change set.
    this.#freeEntityDelta(entity)
  }

  #commitDelete(entity: Entity, prevNode: Node): void {
    let entityId = idLo(entity)
    let entityChildren = this.#entityChildren[entityId]
    // Recursively delete the deleted entity's children, if any.
    if (exists(entityChildren)) {
      for (let childEntity of entityChildren) {
        let childEntityNode = expect(this.#entityNodes[childEntity])
        this.#commitDelete(childEntity, childEntityNode)
      }
      entityChildren.clear()
    }
    // Free the deleted entity's component values.
    for (let i = 0; i < prevNode.type.components.length; i++) {
      let component = prevNode.type.components[i]
      if (hasSchema(component)) {
        this.#freeEntityComponentValue(entity, component)
      }
    }
    // Free the deleted entity from its internal resources.
    this.#freeEntityNode(entity)
    this.#freeEntityDelta(entity)
    this.#freeEntityParent(entity)
    this.#freeEntityId(entity)
    this.#incrementEntityIdVersion(entityId)
    // Remove the deleted entity from the archetype graph and free its prior
    // node if it is no longer of use.
    prevNode.removeEntity(entity)
    if (prevNode.entities.length === 0 && prevNode.hasAnyRelationship()) {
      this.#disposableNodes.add(prevNode)
    }
  }

  #commitMove(entity: Entity, prevNode: Node, nextNode: Node): void {
    let entityDelta = this.#ensureEntityDelta(entity)
    for (let i = 0; i < prevNode.type.components.length; i++) {
      let component = prevNode.type.components[i]
      if (!nextNode.hasComponent(component)) {
        if (hasSchema(component)) {
          // Free component values of components not found in the destination
          // node.
          this.#freeEntityComponentValue(entity, component)
        } else {
          // Detach the modified entity from its current parent.
          let componentHi = idHi(component)
          if (componentHi === ChildOf.relationId) {
            this.#freeEntityParent(entity)
          }
        }
      }
    }
    for (let i = 0; i < nextNode.type.components.length; i++) {
      let component = nextNode.type.components[i]
      if (hasSchema(component)) {
        let componentValue = entityDelta[component]
        // Attach newly added component values. The entity delta should be
        // loaded with component values for any component that did not exist in
        // the source node.
        if (exists(componentValue)) {
          this.#setEntityComponentValue(entity, component, componentValue)
        }
      } else {
        let componentHi = idHi(component)
        if (componentHi === ChildOf.relationId) {
          // Attach the modified entity to its new parent.
          let parentEntityId = idLo(component)
          let parentEntity = expect(
            this[_qualifyEntity](parentEntityId),
            ERR_PARENT_INVALID(entity),
          )
          this.#setEntityParent(entity, parentEntity)
        }
      }
    }
    // Add the modified entity to its destination node.
    this.#setEntityNode(entity, nextNode)
    nextNode.addEntity(entity)
    // Free the modified entity's change set.
    this.#freeEntityDelta(entity)
    // Remove the modified entity from its prior node and free the node if it
    // is no longer in use.
    prevNode.removeEntity(entity)
    if (prevNode.entities.length === 0 && prevNode.hasAnyRelationship()) {
      this.#disposableNodes.add(prevNode)
    }
  }

  #updateEntityDelta(entity: Entity, type: Type, values: unknown[]): void {
    let entityDelta = this.#ensureEntityDelta(entity)
    let j = 0
    for (let i = 0; i < type.components.length; i++) {
      let component = type.components[i]
      let componentSchema = getSchema(component)
      if (exists(componentSchema)) {
        if (componentSchema === _dynamic) {
          // Values must be provided for components without schema.
          entityDelta[component] = expect(values[j++])
        } else {
          // Update the entity change set with a user-provided component value,
          // or auto-initialize a component value from the component schema.
          entityDelta[component] =
            values[j++] ??
            this[_getComponentStore](component)[entity] ??
            express(component)
        }
      }
    }
  }

  #initQuery(query: Query, hash: number, node: Node, system: System): void {
    let includeExistingNode = (node: Node) => {
      query.includeNode(node)
    }
    let includeCreatedNode = (node: Node) => {
      query.includeNode(node)
    }
    let unbindQueryOrExcludeNode = (deletedNode: Node) => {
      if (node === deletedNode) {
        system.queries.delete(hash)
      } else {
        query.excludeNode(node)
      }
    }
    // Add existing nodes to the query that match the query's terms.
    node.traverseAdd(includeExistingNode)
    // Listen for newly created and deleted nodes that could match the query's
    // terms.
    node.onNodeCreated.add(includeCreatedNode)
    node.onNodeDeleted.add(unbindQueryOrExcludeNode)
    // Link the query to its originating system.
    system.queries.set(hash, query)
  }

  #initMonitor(
    monitor: Monitor,
    hash: number,
    node: Node,
    system: System,
  ): void {
    let unbindMonitor = (deletedNode: Node) => {
      if (node === deletedNode) {
        system.monitors.delete(hash)
      }
    }
    // Free the monitor when its node is deleted.
    node.onNodeDeleted.add(unbindMonitor)
    // Link the monitor to its originating system.
    system.monitors.set(hash, monitor)
  }

  /**
   * Check to see if an entity has a component using a component id. Returns `true` if
   * the component is present, otherwise returns `false`.
   * @private
   */
  [_hasComponent](entity: Entity, component: Component): boolean {
    let entityNode = this.#getEntityNode(entity)
    if (exists(entityNode)) {
      return entityNode.hasComponent(component)
    }
    return false
  }

  /**
   * Get the array of component values for a given value component.
   * @private
   */
  [_getComponentStore]<T>(component: Component<T>): T[] {
    assert(hasSchema(component), ERR_EXPECTED_VALUE_COMPONENT(component))
    return (this.#componentStores[component] ??= []) as T[]
  }

  /**
   * Dispatch transient entity modification events.
   * @private
   */
  [_emitStagedChanges](): void {
    this.#stageTransaction.drainEntities(this.graph, Phase.Stage)
  }

  /**
   * Write entity modifications to the world and dispatch final entity
   * modification events.
   * @private
   */
  [_commitStagedChanges](): void {
    let commitBatch: TransactionIteratee = (batch, prevNode, nextNode) => {
      if (!exists(prevNode)) {
        /* @__PURE__ */ assert(exists(nextNode))
        batch.forEach(entity => {
          this.#commitMake(entity, nextNode)
        })
      } else if (!exists(nextNode)) {
        batch.forEach(entity => {
          this.#commitDelete(entity, prevNode)
        })
      } else if (nextNode === prevNode) {
        batch.forEach(entity => {
          this.#commitUpdate(entity, nextNode)
        })
      } else {
        batch.forEach(entity => {
          /* @__PURE__ */ assert(exists(prevNode))
          /* @__PURE__ */ assert(exists(nextNode))
          this.#commitMove(entity, prevNode, nextNode)
        })
      }
    }
    // Adjust entities within the archetype graph, update component stores, and
    // notify interested parties (like monitors).
    this.#applyTransaction.drainEntities(this.graph, Phase.Apply, commitBatch)
    this.#disposableNodes.forEach(nodeToPrune => {
      // The node may have been populated after it was flagged for deletion, so
      // we first check if it is still empty.
      if (nodeToPrune.isEmpty()) {
        // If the node and its descendants have no entities, we free each
        // descendant node and notify all retained ancestor nodes.
        nodeToPrune.traverseAdd(nodeAdd =>
          nodeToPrune.traverseRem(nodeRem => {
            nodeRem.onNodeDeleted.emit(nodeAdd)
            Node.unlink(nodeRem, nodeAdd)
          }),
        )
      }
    })
    this.#disposableNodes.clear()
  }

  [_drainCommands]() {
    let commandQueues = this.#commandQueues.values()
    for (let i = 0; i < commandQueues.length; i++) {
      let commandQueue = commandQueues[i]
      while (commandQueue.length > 0) {
        commandQueue.pop()
      }
    }
  }

  /**
   * Upgrade an entity id to a versioned entity handle.
   * @private
   */
  [_qualifyEntity](entityId: number): Maybe<Entity> {
    let entityIdVersion = this.#getEntityIdVersion(entityId)
    if (!exists(entityIdVersion)) return
    return makeId(entityId, entityIdVersion) as Entity
  }

  /**
   * Create an entity with a provided id.
   * @private
   */
  [_reserveEntity]<T extends Component[]>(
    entityId: number,
    type: Type<T>,
    ...values: ValuesInit<T>
  ): Entity {
    assert(this.#getEntityIdVersion(entityId) === undefined)
    let entity = makeId(entityId, 0) as Entity
    let nextNode = this.graph.nodeOfType(type)
    this.#incrementEntityIdVersion(entityId)
    this.#relocateEntity(entity, undefined, nextNode)
    this.#updateEntityDelta(entity, type, values)
    return entity
  }

  /**
   * Set the value of a resource.
   */
  setResource<T>(resource: Resource<T>, value: T): void {
    this.#resources[resource] = value
  }

  /**
   * Check for the presence of a resource. Returns true if a value has been set
   * for the resource, otherwise returns false.
   */
  hasResource(resource: Resource<unknown>): boolean {
    return exists(this.#resources[resource])
  }

  /**
   * Get the value of a resource. Throws an error if no value has been set for
   * the resource.
   */
  getResource<T>(resource: Resource<T>): T {
    return expect(this.#resources[resource]) as T
  }

  /**
   * Get the value of a resource. Returns undefined if no value has been set for the
   * resource
   */
  tryGetResource<T>(resource: Resource<T>): Maybe<T> {
    return this.#resources[resource] as Maybe<T>
  }

  /**
   * Check to see if an entity is alive. Returns `true` if the entity is alive,
   * otherwise returns `false`.
   */
  exists(entity: Entity): boolean {
    try {
      this.#validateEntityVersion(entity)
      return true
    } catch {
      return false
    }
  }

  /**
   * Create a void entity.
   * @example <caption>Create an entity with no components</caption>
   * let entity = world.create()
   */
  create(): Entity
  /**
   * Create an entity with components.
   * @example
   * let Body = type(Position, Velocity)
   * let entity = world.create(Body)
   */
  create<T extends Component[]>(type: Type<T>, ...values: ValuesInit<T>): Entity
  create(type: Type = Type.VOID, ...values: unknown[]) {
    let entity = this.#allocEntityId()
    let nextNode = this.graph.nodeOfType(type)
    this.#relocateEntity(entity, undefined, nextNode)
    this.#updateEntityDelta(entity, type, values)
    return entity
  }

  /**
   * Add a type to an entity.
   */
  add<T extends Component[]>(
    entity: Entity,
    type: Type<T>,
    ...values: ValuesInit<T>
  ): void {
    this.#validateEntityVersion(entity)
    let prevNode = this.#getStagedEntityNode(entity)
    if (!exists(prevNode)) {
      return
    }
    let nextNode = this.graph.nodeAddType(prevNode, type)
    if (nextNode === prevNode) {
      return
    }
    this.#updateEntityDelta(entity, type, values)
    this.#relocateEntity(entity, prevNode, nextNode)
  }

  /**
   * Remove a type from an entity.
   */
  remove(entity: Entity, type: Type): void {
    this.#validateEntityVersion(entity)
    let prevNode = this.#getStagedEntityNode(entity)
    if (!exists(prevNode)) {
      return
    }
    let nextNode = this.graph.nodeRemoveType(prevNode, type)
    if (nextNode === prevNode) {
      return
    }
    this.#relocateEntity(entity, prevNode, nextNode)
  }

  /**
   * Destroy an entity.
   * @example
   * world.delete(entity)
   */
  delete(entity: Entity): void {
    this.#validateEntityVersion(entity)
    let prevNode = this.#getStagedEntityNode(entity)
    if (!exists(prevNode)) {
      return
    }
    this.#relocateEntity(entity, prevNode)
  }

  /**
   * Get the value of a value component for an entity. Returns the component value if
   * present, otherwise returns `undefined`.
   * @example
   * let position = world.get(entity, Position)
   */
  get<T>(entity: Entity, type: Singleton<T>): Maybe<Value<T>>
  /**
   * Check if an entity has a tag component. Returns `true` if present, otherwise returns
   * `undefined`.
   */
  get(entity: Entity, type: Singleton<Tag>): Maybe<boolean>
  get(entity: Entity, type: Type) {
    this.#validateEntityVersion(entity)
    let entityNode = expect(
      this.#getEntityNode(entity),
      ERR_MISSING_COMPONENT(entity),
    )
    let component = type.components[0]
    return entityNode.hasComponent(component)
      ? hasSchema(component)
        ? this[_getComponentStore](component)[entity]
        : true
      : undefined
  }

  /**
   * Set the value of a component for an entity. Throws an error if the entity
   * does not have the component.
   */
  set<T>(entity: Entity, type: Singleton<T>, value: Value<T>): void {
    this.#validateEntityVersion(entity)
    let entityNode = expect(
      this.#getEntityNode(entity),
      ERR_MISSING_COMPONENT(entity),
    )
    let component = type.components[0]
    assert(
      entityNode.hasComponent(component),
      ERR_EXPECTED_ENTITY_HAS_COMPONENT(entity, component),
    )
    this.#setEntityComponentValue(entity, component, value)
  }

  has(entity: Entity, type: Singleton): boolean {
    let entityNode = expect(
      this.#getEntityNode(entity),
      ERR_MISSING_COMPONENT(entity),
    )
    let component = type.components[0]
    if (exists(entityNode)) {
      return entityNode.hasComponent(component)
    }
    return false
  }

  /**
   * Find the parent of an entity.
   * @example <caption>Find the parent of an entity</caption>
   * let parent = world.make()
   * let child = world.make(type(ChildOf(parent)))
   * // world ops are deferred, so next tick:
   * assert(world.parentOf(child) === parent)
   * @example <caption>Find all ancestors of an entity</caption>
   * while (exists(e = world.parentOf(e))) parents.push(e)
   */
  parentOf(entity: Entity): Maybe<Entity> {
    this.#validateEntityVersion(entity)
    return this.#entityParents[entity]
  }

  /**
   * Resolve a query builder for a given set of types, components, and
   * relationships.
   */
  of<T extends QueryTerms>(...queryTerms: T): QueryAPI<T>
  of() {
    let querySystem = this.getResource(CurrentSystem)
    let queryTerms = arguments as unknown as QueryTerms
    let queryTermsHash = hashQueryTerms(queryTerms)
    let query = querySystem.queries.get(queryTermsHash)
    if (!exists(query)) {
      let queryType = new Type(queryTerms)
      let queryStores = getQueryStores(this, queryType)
      let queryNode = this.graph.nodeOfType(queryType)
      query = new Query(queryType, queryStores)
      this.#initQuery(query, queryTermsHash, queryNode, querySystem)
    }
    return query
  }

  /**
   * Resolve a monitor for a given set of types, components, and relationships.
   * Monitors are updated at the end of the step, after entity modifications
   * are applied to the world.
   */
  monitor(...queryTerms: QueryTerms): Monitor
  monitor() {
    let monitorSystem = this.getResource(CurrentSystem)
    let monitorTerms = arguments as unknown as QueryTerms
    let monitorTermsHash = hashQueryTerms(monitorTerms)
    let monitor = monitorSystem.monitors.get(monitorTermsHash)
    if (!exists(monitor)) {
      let monitorType = new Type(monitorTerms)
      let monitorNode = this.graph.nodeOfType(monitorType)
      monitor = new Monitor(
        monitorNode,
        Phase.Apply,
        monitorType.excludedComponents,
      )
      this.#initMonitor(monitor, monitorTermsHash, monitorNode, monitorSystem)
    }
    return monitor
  }

  /**
   * Resolve an immediate monitor for a given set of types, components, and
   * relationships. Immediate monitors are updated between systems, before the
   * end of a step, providing the means to intercept excluded component values
   * before they are garbage collected.
   */
  monitorImmediate(...queryTerms: QueryTerms): Monitor
  monitorImmediate() {
    let monitorSystem = this.getResource(CurrentSystem)
    let monitorTerms = arguments as unknown as QueryTerms
    let monitorTermsHash = hashQueryTerms(monitorTerms)
    let monitor = monitorSystem.monitors.get(monitorTermsHash)
    if (!exists(monitor)) {
      let monitorType = new Type(monitorTerms)
      let monitorNode = this.graph.nodeOfType(monitorType)
      monitor = new Monitor(
        monitorNode,
        Phase.Stage,
        monitorType.excludedComponents,
      )
      this.#initMonitor(monitor, monitorTermsHash, monitorNode, monitorSystem)
    }
    return monitor
  }

  dispatch<T>(commandType: Singleton<T>, command: Value<T>): void {
    this.#ensureCommandQueue(commandType).unshift(command)
  }

  commands<T>(commandType: Singleton<T>): Value<T>[] {
    return this.#ensureCommandQueue(commandType) as Value<T>[]
  }
}

let getQueryStores = (world: World, type: Type) => {
  let queryStores = [] as unknown[][]
  for (let i = 0; i < type.components.length; i++) {
    let component = type.components[i]
    if (hasSchema(component)) {
      queryStores[component] = world[_getComponentStore](component)
    }
  }
  return queryStores
}
