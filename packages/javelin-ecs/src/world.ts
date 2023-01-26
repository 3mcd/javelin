import {assert, exists, expect, Maybe} from "@javelin/lib"
import {Entity, idHi, idLo, LO_MASK, makeId} from "./entity.js"
import {Graph, Node} from "./graph.js"
import {ChildOf} from "./index.js"
import {Monitor} from "./monitor.js"
import {QueryAPI, Query} from "./query.js"
import {makeResource, Resource} from "./resource.js"
import {System} from "./system.js"
import {
  hasSchema,
  Component,
  Tag,
  ComponentValue,
  ComponentInitValues,
  getSchema,
  expressComponent,
  Dynamic,
} from "./component.js"
import {Transaction, TransactionIteratee} from "./transaction.js"
import {
  hashSpec,
  normalizeSpec,
  Selector,
  Spec,
  Type,
} from "./type.js"

export enum Phase {
  Stage = "stage",
  Apply = "apply",
}

export let CurrentSystem = makeResource<System>()

export class World {
  #componentStores
  #entityChildren
  #entityDeltas
  #entityNodes
  #entityParents
  #entityIdVersions
  #expiredNodes
  #freeEntityIds
  #nextEntityId
  #resources
  #applyTransaction
  #stageTransaction

  readonly graph

  constructor() {
    this.#componentStores = [] as unknown[][]
    this.#entityChildren = [] as Set<Entity>[]
    this.#entityDeltas = [] as unknown[][]
    this.#entityNodes = [] as Node[]
    this.#entityParents = [] as Entity[]
    this.#entityIdVersions = [] as number[]
    this.#expiredNodes = new Set<Node>()
    this.#freeEntityIds = [] as number[]
    this.#nextEntityId = 0
    this.#resources = [] as unknown[]
    this.#stageTransaction = new Transaction()
    this.#applyTransaction = new Transaction()
    this.graph = new Graph()
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
      assert(entityId <= LO_MASK, "too many living entities")
    }
    return makeId(entityId, entityVersion) as Entity
  }

  #freeEntityId(entity: Entity) {
    let entityId = idLo(entity)
    this.#freeEntityIds.push(entityId)
  }

  #validateEntityVersion(entity: Entity) {
    let entityId = idLo(entity)
    let entityIdVersion = idHi(entity)
    assert(
      this.#entityIdVersions[entityId] === entityIdVersion,
      `Entity ${entity} (id ${entityId}) is invalid because it has been deleted`,
    )
    return entityId
  }

  #getEntityIdVersion(entityId: number): number | undefined {
    return this.#entityIdVersions[entityId]
  }

  #incrementEntityIdVersion(entityId: number) {
    let entityVersion = this.#entityIdVersions[entityId]
    this.#entityIdVersions[entityId] = exists(entityVersion)
      ? entityVersion + 1
      : 0
  }

  #setEntityComponentValue(
    entity: Entity,
    component: Component,
    componentValue: unknown,
  ) {
    let componentStore = this.getComponentStore(component)
    componentStore[entity] = componentValue
  }

  #freeEntityComponentValue(entity: Entity, component: Component) {
    let componentStore = this.getComponentStore(component)
    componentStore[entity] = undefined!
  }

  #ensureEntityDelta(entity: Entity) {
    return (this.#entityDeltas[entity] ??= [])
  }

  #freeEntityDelta(entity: Entity) {
    this.#entityDeltas[entity] = undefined!
  }

  #ensureEntityChildren(entity: Entity) {
    return (this.#entityChildren[entity] ??= new Set())
  }

  #setEntityParent(entity: Entity, entityParent: Entity) {
    this.#ensureEntityChildren(entityParent).add(entity)
    this.#entityParents[entity] = entityParent
  }

  #freeEntityParent(entity: Entity) {
    let entityParent = this.parentOf(entity)
    if (exists(entityParent)) {
      this.#ensureEntityChildren(entityParent).delete(entity)
      this.#entityParents[entity] = undefined!
    }
  }

  #getEntityNode(entity: Entity) {
    return this.#entityNodes[entity]
  }

  #setEntityNode(entity: Entity, node: Node) {
    this.#entityNodes[entity] = node
  }

  #freeEntityNode(entity: Entity) {
    this.#entityNodes[entity] = undefined!
  }

  #getStagedEntityNode(entity: Entity) {
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

  #relocateEntity(entity: Entity, prevNode?: Node, nextNode?: Node) {
    let prevHash = prevNode?.type.hash ?? 0
    let nextHash = nextNode?.type.hash ?? 0
    // Update both stage and apply transactions. The stage transaction is
    // drained after each system, while the apply transaction is drained after
    // each step.
    this.#stageTransaction.relocateEntity(entity, prevHash, nextHash)
    this.#applyTransaction.relocateEntity(entity, prevHash, nextHash)
  }

  #commitMake(entity: Entity, nextNode: Node) {
    let entityDelta = this.#ensureEntityDelta(entity)
    for (let i = 0; i < nextNode.type.components.length; i++) {
      let component = nextNode.type.components[i]
      if (hasSchema(component)) {
        // Insert the new entity's component values into their respective
        // component stores.
        let componentValue = expect(entityDelta[component])
        this.#setEntityComponentValue(
          entity,
          component,
          componentValue,
        )
      } else {
        let componentHi = idHi(component)
        // Attach the new entity to its parent component if it was defined
        // with one.
        if (componentHi === ChildOf.relationId) {
          let parentEntityId = idLo(component)
          let parentEntity = expect(this.qualify(parentEntityId))
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

  #commitUpdate(entity: Entity, nextNode: Node) {
    let entityDelta = this.#ensureEntityDelta(entity)
    // Overwrite the updated entity's existing component values in their
    // respective component stores.
    for (let i = 0; i < nextNode.type.components.length; i++) {
      let component = nextNode.type.components[i]
      if (hasSchema(component)) {
        let componentValue = expect(entityDelta[component])
        this.#setEntityComponentValue(
          entity,
          component,
          componentValue,
        )
      }
    }
    // Free the existing entity's component change set.
    this.#freeEntityDelta(entity)
  }

  #commitDelete(entity: Entity, prevNode: Node) {
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
    if (
      prevNode.entities.length === 0 &&
      prevNode.hasAnyRelationship()
    ) {
      this.#expiredNodes.add(prevNode)
    }
  }

  #commitMove(entity: Entity, prevNode: Node, nextNode: Node) {
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
          this.#setEntityComponentValue(
            entity,
            component,
            componentValue,
          )
        }
      } else {
        let componentHi = idHi(component)
        if (componentHi === ChildOf.relationId) {
          // Attach the modified entity to its new parent.
          let parentEntityId = idLo(component)
          let parentEntity = expect(this.qualify(parentEntityId))
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
    if (
      prevNode.entities.length === 0 &&
      prevNode.hasAnyRelationship()
    ) {
      this.#expiredNodes.add(prevNode)
    }
  }

  #updateEntityDelta(
    entity: Entity,
    selector: Selector,
    selectorValues: unknown[],
  ) {
    let entityDelta = this.#ensureEntityDelta(entity)
    let j = 0
    for (let i = 0; i < selector.includedComponents.length; i++) {
      let component = selector.includedComponents[i]
      let componentSchema = getSchema(component)
      if (exists(componentSchema)) {
        if (componentSchema === Dynamic) {
          // Values must be provided for components without schema.
          entityDelta[component] = expect(selectorValues[j++])
        } else {
          // Update the entity change set with a user-provided component value,
          // or auto-initialize a component value from the component schema.
          entityDelta[component] =
            selectorValues[j++] ?? expressComponent(component)
        }
      }
    }
  }

  #initQuery(query: Query, hash: number, node: Node, system: System) {
    function includeExistingNode(node: Node) {
      query.includeNode(node)
    }
    function includeCreatedNode(node: Node) {
      query.includeNode(node)
    }
    function unbindQueryOrExcludeNode(deletedNode: Node) {
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
  ) {
    function unbindMonitor(deletedNode: Node) {
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
   * Set the value of a resource.
   */
  setResource<T>(resource: Resource<T>, value: T) {
    this.#resources[resource] = value
  }

  /**
   * Check for the presence of a resource. Returns true if a value has been set
   * for the resource, otherwise returns false.
   */
  hasResource<T>(resource: Resource<T>) {
    return resource in this.#resources
  }

  /**
   * Get the value of a resource. Throws an error if no value has been set for
   * the resource.
   */
  getResource<T>(resource: Resource<T>) {
    return expect(this.#resources[resource]) as T
  }

  /**
   * Create an entity with a provided id.
   * @private
   */
  reserve<T extends Component[]>(
    entityId: number,
    selector: Selector<T>,
    ...selectorValues: ComponentInitValues<T>
  ) {
    assert(this.#getEntityIdVersion(entityId) === undefined)
    let entity = makeId(entityId, 0) as Entity
    let nextNode = this.graph.nodeOfType(selector.type)
    this.#incrementEntityIdVersion(entityId)
    this.#relocateEntity(entity, undefined, nextNode)
    this.#updateEntityDelta(entity, selector, selectorValues)
    return entity
  }

  /**
   * Upgrade an entity id to a complete entity handle.
   * @private
   */
  qualify(entityId: number): Maybe<Entity> {
    let entityIdVersion = this.#getEntityIdVersion(entityId)
    if (entityIdVersion === undefined) return
    return makeId(entityId, entityIdVersion) as Entity
  }

  exists(entity: Entity) {
    try {
      this.#validateEntityVersion(entity)
      return true
    } catch {
      return false
    }
  }

  /**
   * Create an entity.
   * @example <caption>Create an entity with no data</caption>
   * let entity = world.create()
   * @example <caption>Create an entity with a type</caption>
   * let Body = type(Position, Velocity)
   * let entity = world.create(Body)
   */
  create<T extends Component[]>(
    selector: Selector<T>,
    ...selectorValues: ComponentInitValues<T>
  ) {
    let entity = this.#allocEntityId()
    let nextNode = this.graph.nodeOfType(selector.type)
    this.#relocateEntity(entity, undefined, nextNode)
    this.#updateEntityDelta(entity, selector, selectorValues)
    return entity
  }

  /**
   * Add a type to an entity.
   */
  add<T extends Component[]>(
    entity: Entity,
    selector: Selector<T>,
    ...selectorValues: ComponentInitValues<T>
  ) {
    this.#validateEntityVersion(entity)
    let prevNode = this.#getStagedEntityNode(entity)
    if (!exists(prevNode)) {
      return
    }
    let nextNode = this.graph.nodeAddType(prevNode, selector.type)
    if (nextNode === prevNode) {
      return
    }
    this.#updateEntityDelta(entity, selector, selectorValues)
    this.#relocateEntity(entity, prevNode, nextNode)
  }

  /**
   * Remove a type from an entity.
   */
  remove(entity: Entity, selector: Selector) {
    this.#validateEntityVersion(entity)
    let prevNode = this.#getStagedEntityNode(entity)
    if (!exists(prevNode)) {
      return
    }
    let nextNode = this.graph.nodeRemoveType(prevNode, selector.type)
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
  delete(entity: Entity) {
    this.#validateEntityVersion(entity)
    let prevNode = this.#getStagedEntityNode(entity)
    if (!exists(prevNode)) {
      return
    }
    this.#relocateEntity(entity, prevNode)
  }

  /**
   * Get the value of a component for an entity.
   * * If the component is a tag, returns `true` if present, otherwise
   * returns `undefined`
   * * If the component is a component, the component value is returned
   * if present, otherwise returns `undefined`
   * @example
   * let position = world.get(entity, Position)
   */
  get<T>(
    entity: Entity,
    selector: Selector<[Component<T>]>,
  ): ComponentValue<T>
  get(entity: Entity, selector: Selector<[Component<Tag>]>): boolean
  get(entity: Entity, selector: Selector) {
    this.#validateEntityVersion(entity)
    let entityNode = this.#getEntityNode(entity)
    let component = selector.includedComponents[0]
    return entityNode.hasComponent(component)
      ? !hasSchema(component) ||
          this.getComponentStore(component)[entity]
      : undefined
  }

  /**
   * Set the value of a component for an entity. Throws an error if the entity
   * does not have the component.
   */
  set<T>(
    entity: Entity,
    selector: Selector<[Component<T>]>,
    selectorValue: ComponentValue<T>,
  ) {
    this.#validateEntityVersion(entity)
    let node = this.#getEntityNode(entity)
    let component = selector.includedComponents[0]
    assert(node.hasComponent(component))
    this.#setEntityComponentValue(entity, component, selectorValue)
  }

  /**
   * Get the array of component values for a given component.
   */
  getComponentStore(component: Component) {
    assert(hasSchema(component))
    return (this.#componentStores[component] ??= [])
  }

  /**
   * Dispatch transient entity modification events.
   * @private
   */
  emitStagedChanges() {
    this.#stageTransaction.drainEntities(this.graph, Phase.Stage)
  }

  /**
   * Write entity modifications to the world and dispatch final entity
   * modification events.
   * @private
   */
  commitStagedChanges() {
    let commitBatch: TransactionIteratee = (
      batch,
      prevNode,
      nextNode,
    ) => {
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
    this.#applyTransaction.drainEntities(
      this.graph,
      Phase.Apply,
      commitBatch,
    )
    this.#expiredNodes.forEach(nodeToPrune => {
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
    this.#expiredNodes.clear()
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
  parentOf(entity: Entity) {
    this.#validateEntityVersion(entity)
    return this.#entityParents[entity]
  }

  /**
   * Resolve a query builder for a given set of types, components, and
   * relationships.
   */
  of<T extends Spec>(...spec: T): QueryAPI<T>
  of() {
    let querySystem = this.getResource(CurrentSystem)
    let querySpec = arguments as unknown as Spec
    let queryHash = hashSpec(querySpec)
    let query = querySystem.queries.get(queryHash)
    if (!exists(query)) {
      let querySelector = new Selector(querySpec)
      let queryStores = getQueryStores(this, querySelector.type)
      let queryNode = this.graph.nodeOfType(querySelector.type)
      query = new Query(querySelector, queryStores)
      this.#initQuery(query, queryHash, queryNode, querySystem)
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
    let monitorSystem = this.getResource(CurrentSystem)
    let monitorSpec = arguments as unknown as Spec
    let monitorHash = hashSpec(monitorSpec)
    let monitor = monitorSystem.monitors.get(monitorHash)
    if (!exists(monitor)) {
      let {includedComponents, excludedComponents} =
        normalizeSpec(monitorSpec)
      let monitorNodeType = Type.of(includedComponents)
      let monitorNode = this.graph.nodeOfType(monitorNodeType)
      monitor = new Monitor(
        monitorNode,
        Phase.Apply,
        excludedComponents,
      )
      this.#initMonitor(
        monitor,
        monitorHash,
        monitorNode,
        monitorSystem,
      )
    }
    return monitor
  }

  /**
   * Resolve an immediate monitor for a given set of types, components, and
   * relationships. Immediate monitors are updated between systems, before the
   * end of a step, providing the means to intercept excluded component values
   * before they are garbage collected.
   */
  monitorImmediate(...spec: Spec): Monitor
  monitorImmediate() {
    let monitorSystem = this.getResource(CurrentSystem)
    let monitorSpec = arguments as unknown as Spec
    let monitorHash = hashSpec(monitorSpec)
    let monitor = monitorSystem.monitors.get(monitorHash)
    if (!exists(monitor)) {
      let {includedComponents, excludedComponents} =
        normalizeSpec(monitorSpec)
      let monitorNodeType = Type.of(includedComponents)
      let monitorNode = this.graph.nodeOfType(monitorNodeType)
      monitor = new Monitor(
        monitorNode,
        Phase.Stage,
        excludedComponents,
      )
      this.#initMonitor(
        monitor,
        monitorHash,
        monitorNode,
        monitorSystem,
      )
    }
    return monitor
  }
}

let getQueryStores = (world: World, type: Type) => {
  let queryStores = [] as unknown[][]
  for (let i = 0; i < type.components.length; i++) {
    let component = type.components[i]
    if (hasSchema(component)) {
      queryStores[component] = world.getComponentStore(component)
    }
  }
  return queryStores
}
