import {
  exists,
  HASH_BASE,
  hashWord,
  hashWords,
  Maybe,
  normalizeHash,
  SparseSet,
} from "@javelin/lib"
import {Entity} from "./entity.js"
import {isRelationship} from "./relation.js"
import {Signal} from "./signal.js"
import {Component} from "./component.js"
import {TransactionEvent} from "./transaction.js"
import {Type, validateComponents} from "./type.js"

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
  readonly sparseTerms
  readonly type

  /**
   * Compute the hash of the difference in terms between two nodes.
   */
  static diff(nodeA: Node, nodeB: Node) {
    let diffHash = HASH_BASE
    let termAIndex = 0
    let termBIndex = 0
    while (
      termAIndex < nodeA.type.components.length &&
      termBIndex < nodeB.type.components.length
    ) {
      let termA = nodeA.type.components[termAIndex]
      let termB = nodeB.type.components[termBIndex]
      if (termA === termB) {
        termAIndex++
        termBIndex++
      } else if (termA < termB) {
        diffHash = hashWord(diffHash, termA)
        termAIndex++
      } else if (termA > termB) {
        diffHash = hashWord(diffHash, termB)
        termBIndex++
      }
    }
    if (termAIndex > nodeA.type.components.length - 1) {
      while (termBIndex < nodeB.type.components.length) {
        diffHash = hashWord(
          diffHash,
          nodeB.type.components[termBIndex],
        )
        termBIndex++
      }
    } else if (termBIndex > nodeB.type.components.length - 1) {
      while (termAIndex < nodeA.type.components.length) {
        diffHash = hashWord(
          diffHash,
          nodeA.type.components[termAIndex],
        )
        termAIndex++
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
    let termANotSuperset = false
    let termAIndex = 0
    let termBIndex = 0
    let termMatches = 0
    while (
      termAIndex < nodeA.type.components.length &&
      termBIndex < nodeB.type.components.length
    ) {
      let termA = nodeA.type.components[termAIndex]
      let termB = nodeB.type.components[termBIndex]
      if (termA > termB) {
        termBIndex++
      } else if (termA < termB) {
        termANotSuperset = true
        termAIndex++
      } else {
        termMatches++
        termAIndex++
        termBIndex++
      }
    }
    if (termMatches === nodeA.type.components.length) return 1
    if (termMatches === nodeB.type.components.length) return 2
    return termANotSuperset ? 0 : 3
  }

  /**
   * Connect a node of lower specificity to a node of higher specificity.
   */
  static link(
    nodeRem: Node,
    nodeAdd: Node,
    diffHash = Node.diff(nodeRem, nodeAdd),
  ) {
    if (
      nodeRem.edgesAdd.has(diffHash) ||
      nodeAdd.edgesRem.has(diffHash)
    ) {
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

  constructor(sortedTerms: Component[] = []) {
    let sparseTerms = [] as number[]
    for (let i = 0; i < sortedTerms.length; i++) {
      sparseTerms[sortedTerms[i]] = i
    }
    this.edgesAdd = new SparseSet<Node>()
    this.edgesRem = new SparseSet<Node>()
    this.entities = [] as Entity[]
    this.entityIndices = [] as number[]
    this.onEntitiesExcluded = new Signal<TransactionEvent>()
    this.onEntitiesIncluded = new Signal<TransactionEvent>()
    this.onNodeCreated = new Signal<Node>()
    this.onNodeDeleted = new Signal<Node>()
    this.sparseTerms = sparseTerms
    this.type = Type.of(sortedTerms)
  }

  /**
   * Check if the node's entities have a term.
   */
  hasComponent(term: Component) {
    return exists(this.sparseTerms[term])
  }

  hasAnyRelationship() {
    for (let i = 0; i < this.type.components.length; i++) {
      let term = this.type.components[i]
      if (isRelationship(term)) {
        return true
      }
    }
    return false
  }

  /**
   * Check if the node has all terms of another node.
   */
  isSupersetOf(node: Node) {
    if (node.type.components.length === 0) {
      return false
    }
    for (let i = 0; i < node.type.components.length; i++) {
      let term = node.type.components[i]
      if (!this.hasComponent(term)) {
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
  traverseRemWithFilter(
    iteratee: NodeIteratee,
    predicate: NodePredicate,
  ) {
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
    this.root = new Node([])
    this.root.onNodeDeleted.add(node => {
      this.nodes[node.type.hash] = undefined!
    })
  }

  /**
   * Create and insert a node whose type is a union of a node's type and
   * another type.
   */
  #createNodeAdd(node: Node, type: Type) {
    if (node === this.root) {
      return this.#createNode(type.components)
    }
    let finalComponents: Component[] = []
    let nodeTermIndex = 0
    let typeTermIndex = 0
    while (
      nodeTermIndex < node.type.components.length &&
      typeTermIndex < type.components.length
    ) {
      let nodeTerm = node.type.components[nodeTermIndex]
      let typeTerm = type.components[typeTermIndex]
      if (nodeTerm === typeTerm) {
        finalComponents.push(nodeTerm)
        nodeTermIndex++
        typeTermIndex++
      } else if (nodeTerm < typeTerm) {
        finalComponents.push(nodeTerm)
        nodeTermIndex++
      } else if (nodeTerm > typeTerm) {
        finalComponents.push(typeTerm)
        typeTermIndex++
      }
    }
    if (nodeTermIndex > node.type.components.length - 1) {
      while (typeTermIndex < type.components.length) {
        finalComponents.push(type.components[typeTermIndex++])
      }
    } else if (typeTermIndex > type.components.length - 1) {
      while (nodeTermIndex < node.type.components.length) {
        finalComponents.push(node.type.components[nodeTermIndex++])
      }
    }
    return this.#createNode(finalComponents)
  }

  /**
   * Create and insert a node whose type is the symmetric difference of a
   * node's type and another type.
   */
  #createNodeRem(node: Node, type: Type) {
    if (node === this.root) {
      return node
    }
    let remTerms: Component[] = []
    let nodeTermIndex = 0
    let typeTermIndex = 0
    while (
      nodeTermIndex < node.type.components.length &&
      typeTermIndex < type.components.length
    ) {
      let nodeTerm = node.type.components[nodeTermIndex]
      let typeTerm = type.components[typeTermIndex]
      if (nodeTerm === typeTerm) {
        nodeTermIndex++
        typeTermIndex++
      } else if (nodeTerm < typeTerm) {
        remTerms.push(nodeTerm)
        nodeTermIndex++
      } else if (nodeTerm > typeTerm) {
        remTerms.push(typeTerm)
        typeTermIndex++
      }
    }
    if (typeTermIndex > type.components.length - 1) {
      while (nodeTermIndex < node.type.components.length) {
        let term = node.type.components[nodeTermIndex++]
        remTerms.push(term)
      }
    }
    return this.#createNode(remTerms)
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
   * Posture a node in the graph by ensuring a path of intermediate nodes
   * between it and the root, and linking it to related nodes.
   */
  #traverseLink(node: Node) {
    let addTerms = [] as Component[]
    let nodeRem: Node = this.root
    // build a path from the base node to the new node
    // e.g. () -> (1) -> (1,5) -> (1,5,104977)
    for (let i = 0; i < node.type.components.length; i++) {
      let term = node.type.components[i]
      let termHash = normalizeHash(hashWord(HASH_BASE, term))
      let nodeAdd = nodeRem.edgesAdd.get(termHash)
      addTerms.push(term)
      if (nodeAdd === undefined) {
        let nextHash = hashWords.apply(null, addTerms)
        nodeAdd = this.nodes[nextHash] ??= new Node(
          Array.from(addTerms),
        )
        Node.link(nodeRem, nodeAdd, termHash)
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
    let node = new Node(components)
    this.nodes[node.type.hash] = node
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
    return this.nodes[type.hash] ?? this.#createNode(type.components)
  }

  /**
   * Get the node whose type is a union of a node's type and another type.
   */
  nodeAddType(node: Node, type: Type): Node {
    return (
      node.edgesAdd.get(type.hash) ?? this.#createNodeAdd(node, type)
    )
  }

  /**
   * Get the node whose type is the symmetric difference of a node's type and
   * another type.
   */
  nodeRemoveType(node: Node, type: Type): Node {
    return (
      node.edgesRem.get(type.hash) ?? this.#createNodeRem(node, type)
    )
  }
}
