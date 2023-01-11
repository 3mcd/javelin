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
  prevNode: Maybe<Node>,
  nextNode: Maybe<Node>,
) => void

function makeBatchKey(prevHash: number, nextHash: number) {
  return (BigInt(nextHash) << 32n) | BigInt(prevHash)
}

function decomposeBatchKeyNext(key: bigint) {
  return Number((key & 0xffffffff00000000n) >> 32n)
}

function decomposeBatchKeyPrev(key: bigint) {
  return Number(key & 0xffffffffn)
}

function makeTransactionEvent(
  phase: string,
  batch: Set<Entity>,
  node: Node,
): TransactionEvent {
  return {phase, batch, node}
}

function emitCreatedEntities(
  phase: string,
  batch: Set<Entity>,
  nextNode: Node,
) {
  let event = makeTransactionEvent(phase, batch, nextNode)
  nextNode.traverseRem(function emitCreatedBatch(node) {
    node.onEntitiesIncluded.emit(event)
  })
}

function emitIncludedEntities(
  phase: string,
  batch: Set<Entity>,
  prevNode: Node,
  nextNode: Node,
) {
  let event = makeTransactionEvent(phase, batch, nextNode)
  nextNode.traverseRemWithFilter(
    function emitIncludedBatch(node) {
      node.onEntitiesIncluded.emit(event)
    },
    node => node !== prevNode && !prevNode.isSupersetOf(node),
  )
}

function emitExcludedEntities(
  phase: string,
  batch: Set<Entity>,
  prevNode: Node,
  nextNode: Node,
) {
  let event = makeTransactionEvent(phase, batch, prevNode)
  prevNode.traverseRemWithFilter(
    function emitExcludedBatch(node) {
      node.onEntitiesExcluded.emit(event)
    },
    node => node !== nextNode && !node.isSupersetOf(nextNode),
  )
}

function emitMovedEntities(
  phase: string,
  batch: Set<Entity>,
  prevNode: Node,
  nextNode: Node,
) {
  let includedEvent = makeTransactionEvent(phase, batch, nextNode)
  let excludedEvent = makeTransactionEvent(phase, batch, prevNode)
  nextNode.traverseRem(function emitIncludedBatch(node) {
    node.onEntitiesIncluded.emit(includedEvent)
  })
  prevNode.traverseRem(function emitExcludedBatch(node) {
    node.onEntitiesIncluded.emit(excludedEvent)
  })
}

export class Transaction {
  #entityIndex
  #entityBatches

  constructor() {
    this.#entityIndex = new SparseSet<bigint>()
    this.#entityBatches = new Map<bigint, Set<Entity>>()
  }

  locateEntity(entity: Entity) {
    let currBatchKey = this.#entityIndex.get(entity)
    if (!exists(currBatchKey)) {
      return
    }
    return decomposeBatchKeyNext(currBatchKey)
  }

  relocateEntity(entity: Entity, prevHash: number, nextHash: number) {
    let prevBatchKey = this.#entityIndex.get(entity) ?? 0n
    let prevBatch = this.#entityBatches.get(prevBatchKey)
    if (exists(prevBatch)) {
      prevBatch.delete(entity)
    }
    let nextBatchKey = makeBatchKey(prevHash, nextHash)
    let nextBatch = this.#entityBatches.get(nextBatchKey)
    if (!exists(nextBatch)) {
      nextBatch = new Set()
      this.#entityBatches.set(nextBatchKey, nextBatch)
    }
    nextBatch.add(entity)
    this.#entityIndex.set(entity, nextBatchKey)
  }

  drainEntities(
    graph: Graph,
    phase: string,
    iteratee?: TransactionIteratee,
  ) {
    this.#entityBatches.forEach(function emitBatch(batch, batchKey) {
      let prevHash = decomposeBatchKeyPrev(batchKey)
      let nextHash = decomposeBatchKeyNext(batchKey)
      let prevNode = graph.findNode(prevHash)
      let nextNode = graph.findNode(nextHash)
      iteratee?.(batch, prevNode, nextNode)
      if (exists(prevNode)) {
        if (nextHash === 0) {
          emitExcludedEntities(phase, batch, prevNode, graph.root)
        } else {
          let nextNode = expect(graph.findNode(nextHash))
          if (nextNode.isSupersetOf(prevNode)) {
            emitIncludedEntities(phase, batch, prevNode, nextNode)
          } else if (prevNode.isSupersetOf(nextNode)) {
            emitExcludedEntities(phase, batch, prevNode, nextNode)
          } else {
            emitMovedEntities(phase, batch, prevNode, nextNode)
          }
        }
      } else {
        emitCreatedEntities(phase, batch, expect(nextNode))
      }
    })
    this.#entityIndex.clear()
    this.#entityBatches.clear()
  }
}
