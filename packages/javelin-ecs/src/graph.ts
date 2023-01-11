import {
  exists,
  HASH_BASE,
  hash_word,
  hash_words,
  Maybe,
  normalize_hash,
  SparseSet,
} from "@javelin/lib"
import {Entity} from "./entity.js"
import {PhaseEvent} from "./phase.js"
import {is_relationship} from "./relation.js"
import {Signal} from "./signal.js"
import {Component} from "./term.js"
import {TransactionEvent} from "./transaction.js"
import {Type} from "./type.js"

type NodeIteratee = (node: Node) => void
type NodePredicate = (node: Node) => boolean

/**
 * Contains entities of identical composition. Nodes are linked to other nodes,
 * forming a graph of relationships between entity archetypes.
 */
export class Node {
  readonly entities
  readonly entity_indices
  readonly edges_add
  readonly edges_rem
  readonly on_entities_excluded
  readonly on_entities_included
  readonly on_node_created
  readonly on_node_deleted
  readonly sparse_terms
  readonly type

  /**
   * Compute the hash of the difference in terms between two nodes.
   */
  static diff(node_a: Node, node_b: Node) {
    let diff_hash = HASH_BASE
    let term_a_index = 0
    let term_b_index = 0
    while (
      term_a_index < node_a.type.components.length &&
      term_b_index < node_b.type.components.length
    ) {
      let term_a = node_a.type.components[term_a_index]
      let term_b = node_b.type.components[term_b_index]
      if (term_a === term_b) {
        term_a_index++
        term_b_index++
      } else if (term_a < term_b) {
        diff_hash = hash_word(diff_hash, term_a)
        term_a_index++
      } else if (term_a > term_b) {
        diff_hash = hash_word(diff_hash, term_b)
        term_b_index++
      }
    }
    if (term_a_index > node_a.type.components.length - 1) {
      while (term_b_index < node_b.type.components.length) {
        diff_hash = hash_word(
          diff_hash,
          node_b.type.components[term_b_index],
        )
        term_b_index++
      }
    } else if (term_b_index > node_b.type.components.length - 1) {
      while (term_a_index < node_a.type.components.length) {
        diff_hash = hash_word(
          diff_hash,
          node_a.type.components[term_a_index],
        )
        term_a_index++
      }
    }
    return normalize_hash(diff_hash)
  }

  /**
   * Compare two nodes. The possible results are:
   * * `1` - `node_a` is a proper superset of `node_b`
   * * `2` - `node_b` is a proper superset of `node_a`
   * * `3` - descendants of `node_b` could be proper subsets of `node_a`
   * * `0` - none of the above
   */
  static match(node_a: Node, node_b: Node) {
    if (node_a === node_b) return 0
    let term_a_not_superset = false
    let term_a_index = 0
    let term_b_index = 0
    let term_matches = 0
    while (
      term_a_index < node_a.type.components.length &&
      term_b_index < node_b.type.components.length
    ) {
      let term_a = node_a.type.components[term_a_index]
      let term_b = node_b.type.components[term_b_index]
      if (term_a > term_b) {
        term_b_index++
      } else if (term_a < term_b) {
        term_a_not_superset = true
        term_a_index++
      } else {
        term_matches++
        term_a_index++
        term_b_index++
      }
    }
    if (term_matches === node_a.type.components.length) return 1
    if (term_matches === node_b.type.components.length) return 2
    return term_a_not_superset ? 0 : 3
  }

  /**
   * Connect a node of lower specificity to a node of higher specificity.
   */
  static link(
    node_rem: Node,
    node_add: Node,
    diff_hash = Node.diff(node_rem, node_add),
  ) {
    if (
      node_rem.edges_add.has(diff_hash) ||
      node_add.edges_rem.has(diff_hash)
    ) {
      return
    }
    node_rem.edges_add.set(diff_hash, node_add)
    node_add.edges_rem.set(diff_hash, node_rem)
  }

  static unlink(node_rem: Node, node_add: Node) {
    let diff_hash = Node.diff(node_rem, node_add)
    node_rem.edges_add.delete(diff_hash)
    node_add.edges_rem.delete(diff_hash)
  }

  constructor(sorted_terms: Component[] = []) {
    let sparse_terms = [] as number[]
    for (let i = 0; i < sorted_terms.length; i++) {
      sparse_terms[sorted_terms[i]] = i
    }
    this.edges_add = new SparseSet<Node>()
    this.edges_rem = new SparseSet<Node>()
    this.entities = [] as Entity[]
    this.entity_indices = [] as number[]
    this.on_entities_excluded = new Signal<TransactionEvent>()
    this.on_entities_included = new Signal<TransactionEvent>()
    this.on_node_created = new Signal<Node>()
    this.on_node_deleted = new Signal<Node>()
    this.sparse_terms = sparse_terms
    this.type = Type.of(sorted_terms)
  }

  /**
   * Check if the node's entities have a term.
   */
  has_component(term: Component) {
    return exists(this.sparse_terms[term])
  }

  has_any_relationship() {
    for (let i = 0; i < this.type.components.length; i++) {
      let term = this.type.components[i]
      if (is_relationship(term)) {
        return true
      }
    }
    return false
  }

  /**
   * Check if the node has all terms of another node.
   */
  is_superset_of(node: Node) {
    if (node.type.components.length === 0) {
      return false
    }
    for (let i = 0; i < node.type.components.length; i++) {
      let term = node.type.components[i]
      if (!this.has_component(term)) {
        return false
      }
    }
    return true
  }

  /**
   * Add an entity to the node.
   */
  add_entity(entity: Entity) {
    this.entity_indices[entity] = this.entities.push(entity) - 1
  }

  /**
   * Remove an entity from the node.
   */
  remove_entity(entity: Entity) {
    let entity_count = this.entities.length
    let entity_index = this.entity_indices[entity]
    let last_entity = this.entities.pop()
    if (entity_index !== entity_count - 1) {
      this.entity_indices[last_entity!] = entity_index
      this.entities[entity_index] = last_entity!
    }
    this.entity_indices[entity] = undefined!
  }

  /**
   * Execute a function recursively for each of the node's ancestors, including
   * the node itself.
   */
  traverse_rem(iteratee: NodeIteratee) {
    let visited_nodes = new Set<Node>()
    let stack: (Node | number)[] = [this]
    let stack_index = 1
    while (stack_index > 0) {
      let node = stack[--stack_index] as Node
      iteratee(node)
      let node_rem_values = node.edges_rem.values()
      for (let i = 0; i < node_rem_values.length; i++) {
        let node_rem = node_rem_values[i]
        if (visited_nodes.has(node_rem)) {
          continue
        }
        visited_nodes.add(node_rem)
        stack[stack_index++] = node_rem
      }
    }
  }

  /**
   * Execute a function recursively for each of the node's ancestors that also
   * match a predicate function, including the node itself.
   */
  traverse_rem_with_filter(
    iteratee: NodeIteratee,
    predicate: NodePredicate,
  ) {
    let visited_nodes = new Set<Node>()
    let stack: (Node | number)[] = [this]
    let stack_index = 1
    while (stack_index > 0) {
      let node = stack[--stack_index] as Node
      iteratee(node)
      let node_rem_values = node.edges_rem.values()
      for (let i = 0; i < node_rem_values.length; i++) {
        let node_rem = node_rem_values[i]
        if (visited_nodes.has(node_rem) || !predicate(node_rem)) {
          continue
        }
        visited_nodes.add(node_rem)
        stack[stack_index++] = node_rem
      }
    }
  }

  /**
   * Execute a function recursively for each of the node's descendants,
   * including the node itself.
   */
  traverse_add(iteratee: NodeIteratee) {
    let visited_nodes = new Set<Node>()
    let stack: (Node | number)[] = [this]
    let stack_index = 1
    while (stack_index > 0) {
      let node = stack[--stack_index] as Node
      iteratee(node)
      let node_add_values = node.edges_add.values()
      for (let i = 0; i < node_add_values.length; i++) {
        let node_add = node_add_values[i]
        if (visited_nodes.has(node_add)) {
          continue
        }
        visited_nodes.add(node_add)
        stack[stack_index++] = node_add
      }
    }
  }

  is_empty() {
    let visited_nodes = new Set<Node>()
    let stack: (Node | number)[] = [this]
    let stack_index = 1
    while (stack_index > 0) {
      let node = stack[--stack_index] as Node
      if (node.entities.length > 0) {
        return false
      }
      let node_add_values = node.edges_add.values()
      for (let i = 0; i < node_add_values.length; i++) {
        let node_add = node_add_values[i]
        if (visited_nodes.has(node_add)) {
          continue
        }
        visited_nodes.add(node_add)
        stack[stack_index++] = node_add
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
    this.root.on_node_deleted.add(node => {
      this.nodes[node.type.hash] = undefined!
    })
  }

  /**
   * Create and insert a node whose type is a union of a node's type and
   * another type.
   */
  #create_node_and(node: Node, type: Type) {
    let add_terms: Component[] = []
    let node_term_index = 0
    let type_term_index = 0
    while (
      node_term_index < node.type.components.length &&
      type_term_index < type.components.length
    ) {
      let node_term = node.type.components[node_term_index]
      let type_term = type.components[type_term_index]
      if (node_term === type_term) {
        add_terms.push(node_term)
        node_term_index++
        type_term_index++
      } else if (node_term < type_term) {
        add_terms.push(node_term)
        node_term_index++
      } else if (node_term > type_term) {
        add_terms.push(type_term)
        type_term_index++
      }
    }
    if (node_term_index > node.type.components.length - 1) {
      while (type_term_index < type.components.length) {
        add_terms.push(type.components[type_term_index++])
      }
    } else if (type_term_index > type.components.length - 1) {
      while (node_term_index < node.type.components.length) {
        add_terms.push(node.type.components[node_term_index++])
      }
    }
    return this.#create_node(add_terms)
  }

  /**
   * Create and insert a node whose type is the symmetric difference of a
   * node's type and another type.
   */
  #create_node_remove(node: Node, type: Type) {
    let rem_terms: Component[] = []
    let node_term_index = 0
    let type_term_index = 0
    while (
      node_term_index < node.type.components.length &&
      type_term_index < type.components.length
    ) {
      let node_term = node.type.components[node_term_index]
      let type_term = type.components[type_term_index]
      if (node_term === type_term) {
        node_term_index++
        type_term_index++
      } else if (node_term < type_term) {
        rem_terms.push(node_term)
        node_term_index++
      } else if (node_term > type_term) {
        rem_terms.push(type_term)
        type_term_index++
      }
    }
    if (type_term_index > type.components.length - 1) {
      while (node_term_index < node.type.components.length) {
        let term = node.type.components[node_term_index++]
        rem_terms.push(term)
      }
    }
    return this.#create_node(rem_terms)
  }

  /**
   * Recursively link a node to related nodes in the graph. Base cases:
   * - the visited node is a superset of the node being linked
   * - neither the visisted node nor its descendants are a subset or superset of the node being linked
   */
  #traverse_link_inner(
    node: Node,
    node_visiting = this.root,
    visited = new Set<Node>([node]),
  ) {
    let node_visiting_add = node_visiting.edges_add.values()
    for (let i = 0; i < node_visiting_add.length; i++) {
      let next = node_visiting_add[i]
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
          this.#traverse_link_inner(node, next, visited)
          break
      }
    }
  }

  /**
   * Posture a node in the graph by ensuring a path of intermediate nodes
   * between it and the root, and linking it to related nodes.
   */
  #traverse_link(node: Node) {
    let add_terms = [] as Component[]
    let node_rem: Node = this.root
    // build a path from the base node to the new node
    // e.g. () -> (1) -> (1,5) -> (1,5,104977)
    for (let i = 0; i < node.type.components.length; i++) {
      let term = node.type.components[i]
      let term_hash = normalize_hash(hash_word(HASH_BASE, term))
      let node_add = node_rem.edges_add.get(term_hash)
      add_terms.push(term)
      if (node_add === undefined) {
        let next_hash = hash_words.apply(null, add_terms)
        node_add = this.nodes[next_hash] ??= new Node(
          Array.from(add_terms),
        )
        Node.link(node_rem, node_add, term_hash)
      }
      node_rem = node_add!
    }
    // link the new node to related paths
    this.#traverse_link_inner(node)
  }

  /**
   * Create and insert the node of a given list of components into the graph.
   */
  #create_node(terms: Component[]) {
    let node = new Node(terms)
    this.nodes[node.type.hash] = node
    this.#traverse_link(node)
    node.traverse_rem(prev => {
      prev.on_node_created.emit(node)
    })
    return node
  }

  /**
   * Find the node of a given hash within the graph.
   */
  find_node(node_hash: number): Maybe<Node> {
    return this.nodes[node_hash]
  }

  /**
   * Get the node of a given type within the graph.
   */
  node_of_type(type: Type) {
    return this.nodes[type.hash] ?? this.#create_node(type.components)
  }

  /**
   * Get the node whose type is a union of a node's type and another type.
   */
  node_add_type(node: Node, type: Type): Node {
    return (
      node.edges_add.get(type.hash) ??
      this.#create_node_and(node, type)
    )
  }

  /**
   * Get the node whose type is the symmetric difference of a node's type and
   * another type.
   */
  node_remove_type(node: Node, type: Type): Node {
    return (
      node.edges_rem.get(type.hash) ??
      this.#create_node_remove(node, type)
    )
  }
}
