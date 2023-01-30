import {
  exists,
  hashWord,
  hashWords,
  HASH_BASE,
  Maybe,
  normalizeHash,
  SparseSet,
} from "@javelin/lib"
import {Component} from "./component.js"
import {Entity} from "./entity.js"
import {Signal} from "./signal.js"
import {TransactionEvent} from "./transaction.js"
import {
  isRelationship,
  NormalizedType,
  Type,
  validateComponents,
} from "./type.js"

type NodeIteratee = (node: Node) => void
type NodePredicate = (node: Node) => boolean

/**
 * Contains entities of identical composition. Nodes are linked to other nodes,
 * forming a graph of relationships between entity archetypes.
 */
export class Node {
  readonly entities
  readonly entityIndices
  readonly edgesAdd
  readonly edgesRem
  readonly onEntitiesExcluded
  readonly onEntitiesIncluded
  readonly onNodeCreated
  readonly onNodeDeleted
  readonly sparseComponents
  readonly type

  /**
   * Compute the hash of the difference in components between two nodes.
   */
  static diff(nodeA: Node, nodeB: Node) {
    let diffHash = HASH_BASE
    let componentAIndex = 0
    let componentBIndex = 0
    while (
      componentAIndex < nodeA.type.components.length &&
      componentBIndex < nodeB.type.components.length
    ) {
      let componentA = nodeA.type.components[componentAIndex]
      let componentB = nodeB.type.components[componentBIndex]
      if (componentA === componentB) {
        componentAIndex++
        componentBIndex++
      } else if (componentA < componentB) {
        diffHash = hashWord(diffHash, componentA)
        componentAIndex++
      } else if (componentA > componentB) {
        diffHash = hashWord(diffHash, componentB)
        componentBIndex++
      }
    }
    if (componentAIndex > nodeA.type.components.length - 1) {
      while (componentBIndex < nodeB.type.components.length) {
        diffHash = hashWord(diffHash, nodeB.type.components[componentBIndex])
        componentBIndex++
      }
    } else if (componentBIndex > nodeB.type.components.length - 1) {
      while (componentAIndex < nodeA.type.components.length) {
        diffHash = hashWord(diffHash, nodeA.type.components[componentAIndex])
        componentAIndex++
      }
    }
    return normalizeHash(diffHash)
  }

  /**
   * Compare two nodes. The possible results are:
   * * `1` - `nodeA` is a proper superset of `nodeB`
   * * `2` - `nodeB` is a proper superset of `nodeA`
   * * `3` - descendants of `nodeB` could be proper subsets of `nodeA`
   * * `0` - none of the above
   */
  static match(nodeA: Node, nodeB: Node) {
    if (nodeA === nodeB) return 0
    let componentANotSuperset = false
    let componentAIndex = 0
    let componentBIndex = 0
    let componentMatches = 0
    while (
      componentAIndex < nodeA.type.components.length &&
      componentBIndex < nodeB.type.components.length
    ) {
      let componentA = nodeA.type.components[componentAIndex]
      let componentB = nodeB.type.components[componentBIndex]
      if (componentA > componentB) {
        componentBIndex++
      } else if (componentA < componentB) {
        componentANotSuperset = true
        componentAIndex++
      } else {
        componentMatches++
        componentAIndex++
        componentBIndex++
      }
    }
    if (componentMatches === nodeA.type.components.length) return 1
    if (componentMatches === nodeB.type.components.length) return 2
    return componentANotSuperset ? 0 : 3
  }

  /**
   * Connect a node of lower specificity to a node of higher specificity.
   */
  static link(
    nodeRem: Node,
    nodeAdd: Node,
    diffHash = Node.diff(nodeRem, nodeAdd),
  ) {
    if (nodeRem.edgesAdd.has(diffHash) || nodeAdd.edgesRem.has(diffHash)) {
      return
    }
    nodeRem.edgesAdd.set(diffHash, nodeAdd)
    nodeAdd.edgesRem.set(diffHash, nodeRem)
  }

  static unlink(nodeRem: Node, nodeAdd: Node) {
    let diffHash = Node.diff(nodeRem, nodeAdd)
    nodeRem.edgesAdd.delete(diffHash)
    nodeAdd.edgesRem.delete(diffHash)
  }

  constructor(type: NormalizedType) {
    let sparseComponents = [] as number[]
    for (let i = 0; i < type.components.length; i++) {
      sparseComponents[type.components[i]] = i
    }
    this.edgesAdd = new SparseSet<Node>()
    this.edgesRem = new SparseSet<Node>()
    this.entities = [] as Entity[]
    this.entityIndices = [] as number[]
    this.onEntitiesExcluded = new Signal<TransactionEvent>()
    this.onEntitiesIncluded = new Signal<TransactionEvent>()
    this.onNodeCreated = new Signal<Node>()
    this.onNodeDeleted = new Signal<Node>()
    this.sparseComponents = sparseComponents
    this.type = NormalizedType.fromComponents(type.components)
  }

  /**
   * Check if the node's entities have a component.
   */
  hasComponent(component: Component) {
    return exists(this.sparseComponents[component])
  }

  hasAnyRelationship() {
    for (let i = 0; i < this.type.components.length; i++) {
      let component = this.type.components[i]
      if (isRelationship(component)) {
        return true
      }
    }
    return false
  }

  /**
   * Check if the node has all components of another node.
   */
  isSupersetOf(node: Node) {
    if (node.type.components.length === 0) {
      return false
    }
    for (let i = 0; i < node.type.components.length; i++) {
      let component = node.type.components[i]
      if (!this.hasComponent(component)) {
        return false
      }
    }
    return true
  }

  /**
   * Add an entity to the node.
   */
  addEntity(entity: Entity) {
    this.entityIndices[entity] = this.entities.push(entity) - 1
  }

  /**
   * Remove an entity from the node.
   */
  removeEntity(entity: Entity) {
    let entityCount = this.entities.length
    let entityIndex = this.entityIndices[entity]
    let lastEntity = this.entities.pop()
    if (entityIndex !== entityCount - 1) {
      this.entityIndices[lastEntity!] = entityIndex
      this.entities[entityIndex] = lastEntity!
    }
    this.entityIndices[entity] = undefined!
  }

  /**
   * Execute a function recursively for each of the node's ancestors, including
   * the node itself.
   */
  traverseRem(iteratee: NodeIteratee) {
    let visitedNodes = new Set<Node>()
    let stack: (Node | number)[] = [this]
    let stackIndex = 1
    while (stackIndex > 0) {
      let node = stack[--stackIndex] as Node
      iteratee(node)
      let nodeRemValues = node.edgesRem.values()
      for (let i = 0; i < nodeRemValues.length; i++) {
        let nodeRem = nodeRemValues[i]
        if (visitedNodes.has(nodeRem)) {
          continue
        }
        visitedNodes.add(nodeRem)
        stack[stackIndex++] = nodeRem
      }
    }
  }

  /**
   * Execute a function recursively for each of the node's ancestors that also
   * match a predicate function, including the node itself.
   */
  traverseRemWithFilter(iteratee: NodeIteratee, predicate: NodePredicate) {
    let visitedNodes = new Set<Node>()
    let stack: (Node | number)[] = [this]
    let stackIndex = 1
    while (stackIndex > 0) {
      let node = stack[--stackIndex] as Node
      iteratee(node)
      let nodeRemValues = node.edgesRem.values()
      for (let i = 0; i < nodeRemValues.length; i++) {
        let nodeRem = nodeRemValues[i]
        if (visitedNodes.has(nodeRem) || !predicate(nodeRem)) {
          continue
        }
        visitedNodes.add(nodeRem)
        stack[stackIndex++] = nodeRem
      }
    }
  }

  /**
   * Execute a function recursively for each of the node's descendants,
   * including the node itself.
   */
  traverseAdd(iteratee: NodeIteratee) {
    let visitedNodes = new Set<Node>()
    let stack: (Node | number)[] = [this]
    let stackIndex = 1
    while (stackIndex > 0) {
      let node = stack[--stackIndex] as Node
      iteratee(node)
      let nodeAddValues = node.edgesAdd.values()
      for (let i = 0; i < nodeAddValues.length; i++) {
        let nodeAdd = nodeAddValues[i]
        if (visitedNodes.has(nodeAdd)) {
          continue
        }
        visitedNodes.add(nodeAdd)
        stack[stackIndex++] = nodeAdd
      }
    }
  }

  isEmpty() {
    let visitedNodes = new Set<Node>()
    let stack: (Node | number)[] = [this]
    let stackIndex = 1
    while (stackIndex > 0) {
      let node = stack[--stackIndex] as Node
      if (node.entities.length > 0) {
        return false
      }
      let nodeAddValues = node.edgesAdd.values()
      for (let i = 0; i < nodeAddValues.length; i++) {
        let nodeAdd = nodeAddValues[i]
        if (visitedNodes.has(nodeAdd)) {
          continue
        }
        visitedNodes.add(nodeAdd)
        stack[stackIndex++] = nodeAdd
      }
    }
    return true
  }
}

/**
 * A graph that forms relationships between entity archetypes. This graph is
 * necessary to efficiently transition entities between nodes and pass world
 * events only to interested subscribers.
 */
export class Graph {
  readonly nodes
  readonly root

  constructor() {
    this.nodes = [] as Node[]
    this.root = new Node(NormalizedType.fromComponents([]))
    this.root.onNodeDeleted.add(node => {
      this.nodes[node.type.hash] = undefined!
    })
  }

  /**
   * Create and insert a node whose type is a union of a node's type and
   * another type.
   */
  #createNodeAdd(node: Node, type: NormalizedType) {
    if (node === this.root) {
      return this.#createNode(type.components)
    }
    let components: Component[] = []
    let nodeComponentIndex = 0
    let typeComponentIndex = 0
    while (
      nodeComponentIndex < node.type.components.length &&
      typeComponentIndex < type.components.length
    ) {
      let nodeComponent = node.type.components[nodeComponentIndex]
      let typeComponent = type.components[typeComponentIndex]
      if (nodeComponent === typeComponent) {
        components.push(nodeComponent)
        nodeComponentIndex++
        typeComponentIndex++
      } else if (nodeComponent < typeComponent) {
        components.push(nodeComponent)
        nodeComponentIndex++
      } else if (nodeComponent > typeComponent) {
        components.push(typeComponent)
        typeComponentIndex++
      }
    }
    if (nodeComponentIndex > node.type.components.length - 1) {
      while (typeComponentIndex < type.components.length) {
        components.push(type.components[typeComponentIndex++])
      }
    } else if (typeComponentIndex > type.components.length - 1) {
      while (nodeComponentIndex < node.type.components.length) {
        components.push(node.type.components[nodeComponentIndex++])
      }
    }
    return this.#createNode(components)
  }

  /**
   * Create and insert a node whose type is the symmetric difference of a
   * node's type and another type.
   */
  #createNodeRem(node: Node, type: NormalizedType) {
    if (node === this.root) {
      return node
    }
    let remcomponents: Component[] = []
    let nodeComponentIndex = 0
    let typeComponentIndex = 0
    while (
      nodeComponentIndex < node.type.components.length &&
      typeComponentIndex < type.components.length
    ) {
      let nodeComponent = node.type.components[nodeComponentIndex]
      let typeComponent = type.components[typeComponentIndex]
      if (nodeComponent === typeComponent) {
        nodeComponentIndex++
        typeComponentIndex++
      } else if (nodeComponent < typeComponent) {
        remcomponents.push(nodeComponent)
        nodeComponentIndex++
      } else if (nodeComponent > typeComponent) {
        remcomponents.push(typeComponent)
        typeComponentIndex++
      }
    }
    if (typeComponentIndex > type.components.length - 1) {
      while (nodeComponentIndex < node.type.components.length) {
        let component = node.type.components[nodeComponentIndex++]
        remcomponents.push(component)
      }
    }
    return this.#createNode(remcomponents)
  }

  /**
   * Recursively link a node to related nodes in the graph. Base cases:
   * - the visited node is a superset of the node being linked
   * - neither the visisted node nor its descendants are a subset or superset of the node being linked
   */
  #traverseLinkInner(
    node: Node,
    nodeVisiting = this.root,
    visited = new Set<Node>([node]),
  ) {
    let nodeVisitingAdd = nodeVisiting.edgesAdd.values()
    for (let i = 0; i < nodeVisitingAdd.length; i++) {
      let next = nodeVisitingAdd[i]
      if (visited.has(next)) continue
      visited.add(next)
      switch (Node.match(node, next)) {
        case 1:
          Node.link(node, next)
          break
        case 2:
          Node.link(next, node)
        // fallthrough:
        case 3:
          this.#traverseLinkInner(node, next, visited)
          break
      }
    }
  }

  /**
   * Posture a node in the graph by ensuring a path of incomponentediate nodes
   * between it and the root, and linking it to related nodes.
   */
  #traverseLink(node: Node) {
    let components = [] as Component[]
    let nodeRem: Node = this.root
    // build a path from the base node to the new node
    // e.g. () -> (1) -> (1,5) -> (1,5,104977)
    for (let i = 0; i < node.type.components.length; i++) {
      let component = node.type.components[i]
      let componentHash = normalizeHash(hashWord(HASH_BASE, component))
      let nodeAdd = nodeRem.edgesAdd.get(componentHash)
      components.push(component)
      if (nodeAdd === undefined) {
        let nextHash = hashWords.apply(null, components)
        nodeAdd = this.nodes[nextHash] ??= new Node(
          NormalizedType.fromComponents(Array.from(components)),
        )
        Node.link(nodeRem, nodeAdd, componentHash)
      }
      nodeRem = nodeAdd!
    }
    // link the new node to related paths
    this.#traverseLinkInner(node)
  }

  /**
   * Create and insert the node of a given list of components into the graph.
   */
  #createNode(components: Component[]) {
    validateComponents(components)
    let nodeType = NormalizedType.fromComponents(components)
    let node = this.nodes[nodeType.hash]
    if (exists(node)) {
      return node
    }
    node = new Node(nodeType)
    this.nodes[nodeType.hash] = node
    this.#traverseLink(node)
    node.traverseRem(prev => {
      prev.onNodeCreated.emit(node)
    })
    return node
  }

  /**
   * Find the node of a given hash within the graph.
   */
  findNode(nodeHash: number): Maybe<Node> {
    return this.nodes[nodeHash]
  }

  /**
   * Get the node of a given type within the graph.
   */
  nodeOfType(type: Type) {
    return (
      this.nodes[type.normalized.hash] ??
      this.#createNode(type.normalized.components)
    )
  }

  /**
   * Get the node whose type is a union of a node's type and another type.
   */
  nodeAddType(node: Node, type: Type): Node {
    let nodeAdd = node.edgesAdd.get(type.normalized.hash)
    if (nodeAdd) {
      return nodeAdd
    }
    nodeAdd = this.#createNodeAdd(node, type)
    node.edgesAdd.set(type.normalized.hash, nodeAdd)
    return nodeAdd
  }

  /**
   * Get the node whose type is the symmetric difference of a node's type and
   * another type.
   */
  nodeRemoveType(node: Node, type: Type): Node {
    let nodeRem = node.edgesRem.get(type.normalized.hash)
    if (nodeRem) {
      return nodeRem
    }
    nodeRem = this.#createNodeRem(node, type.normalized)
    node.edgesRem.set(type.normalized.hash, nodeRem)
    return nodeRem
  }
}
