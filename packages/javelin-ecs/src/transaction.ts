import {exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {Entity} from "./entity"
import {Graph, Node} from "./graph"

export type TransactionEvent = {
  phase: string
  batch: Set<Entity>
  node: Node
}
export type TransactionIteratee = (
  batch: Set<Entity>,
  prev_node: Maybe<Node>,
  next_node: Maybe<Node>,
) => void

function make_batch_key(prev_hash: number, next_hash: number) {
  return (BigInt(next_hash) << 32n) | BigInt(prev_hash)
}

function decompose_batch_key_next(key: bigint) {
  return Number((key & 0xffffffff00000000n) >> 32n)
}

function decompose_batch_key_prev(key: bigint) {
  return Number(key & 0xffffffffn)
}

function make_transaction_event(
  phase: string,
  batch: Set<Entity>,
  node: Node,
): TransactionEvent {
  return {phase, batch, node}
}

function emit_created_entities(
  phase: string,
  batch: Set<Entity>,
  next_node: Node,
) {
  let event = make_transaction_event(phase, batch, next_node)
  next_node.traverse_rem(function emit_created_batch(node) {
    node.on_entities_included.emit(event)
  })
}

function emit_included_entities(
  phase: string,
  batch: Set<Entity>,
  prev_node: Node,
  next_node: Node,
) {
  let event = make_transaction_event(phase, batch, next_node)
  next_node.traverse_rem_with_filter(
    function emit_included_batch(node) {
      node.on_entities_included.emit(event)
    },
    node => node !== prev_node && !prev_node.is_superset_of(node),
  )
}

function emit_excluded_entities(
  phase: string,
  batch: Set<Entity>,
  prev_node: Node,
  next_node: Node,
) {
  let event = make_transaction_event(phase, batch, prev_node)
  prev_node.traverse_rem_with_filter(
    function emit_excluded_batch(node) {
      node.on_entities_excluded.emit(event)
    },
    node => node !== next_node && !node.is_superset_of(next_node),
  )
}

function emit_moved_entities(
  phase: string,
  batch: Set<Entity>,
  prev_node: Node,
  next_node: Node,
) {
  let included_event = make_transaction_event(phase, batch, next_node)
  let excluded_event = make_transaction_event(phase, batch, prev_node)
  next_node.traverse_rem(function emit_included_batch(node) {
    node.on_entities_included.emit(included_event)
  })
  prev_node.traverse_rem(function emit_excluded_batch(node) {
    node.on_entities_included.emit(excluded_event)
  })
}

export class Transaction {
  #entity_index
  #entity_batches

  constructor() {
    this.#entity_index = new SparseSet<bigint>()
    this.#entity_batches = new Map<bigint, Set<Entity>>()
  }

  find(entity: Entity) {
    let curr_batch_key = this.#entity_index.get(entity)
    if (!exists(curr_batch_key)) {
      return
    }
    return decompose_batch_key_next(curr_batch_key)
  }

  reloc(entity: Entity, prev_hash: number, next_hash: number) {
    let prev_batch_key = this.#entity_index.get(entity) ?? 0n
    let prev_batch = this.#entity_batches.get(prev_batch_key)
    if (exists(prev_batch)) {
      prev_batch.delete(entity)
    }
    let next_batch_key = make_batch_key(prev_hash, next_hash)
    let next_batch = this.#entity_batches.get(next_batch_key)
    if (!exists(next_batch)) {
      next_batch = new Set()
      this.#entity_batches.set(next_batch_key, next_batch)
    }
    next_batch.add(entity)
    this.#entity_index.set(entity, next_batch_key)
  }

  drain(graph: Graph, phase: string, iteratee?: TransactionIteratee) {
    this.#entity_batches.forEach(function emit_batch(
      batch,
      batch_key,
    ) {
      let prev_hash = decompose_batch_key_prev(batch_key)
      let next_hash = decompose_batch_key_next(batch_key)
      let prev_node = graph.find_node(prev_hash)
      let next_node = graph.find_node(next_hash)
      iteratee?.(batch, prev_node, next_node)
      if (exists(prev_node)) {
        if (next_hash === 0) {
          emit_excluded_entities(phase, batch, prev_node, graph.root)
        } else {
          let next_node = expect(graph.find_node(next_hash))
          if (next_node.is_superset_of(prev_node)) {
            emit_included_entities(phase, batch, prev_node, next_node)
          } else if (prev_node.is_superset_of(next_node)) {
            emit_excluded_entities(phase, batch, prev_node, next_node)
          } else {
            emit_moved_entities(phase, batch, prev_node, next_node)
          }
        }
      } else {
        emit_created_entities(phase, batch, expect(next_node))
      }
    })
    this.#entity_index.clear()
    this.#entity_batches.clear()
  }
}
