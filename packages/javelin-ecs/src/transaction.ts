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

let makeBatchKey = (prevHash: number, nextHash: number) =>
  (BigInt(nextHash) << 32n) | BigInt(prevHash)

let decomposeBatchKeyNext = (key: bigint) =>
  Number((key & 0xffffffff00000000n) >> 32n)

let decomposeBatchKeyPrev = (key: bigint) => Number(key & 0xffffffffn)

let makeTransactionEvent = (
  phase: string,
  batch: Set<Entity>,
  node: Node,
): TransactionEvent => {
  return {phase, batch, node}
}

let emitCreatedEntities = (
  phase: string,
  batch: Set<Entity>,
  nextNode: Node,
) => {
  let event = makeTransactionEvent(phase, batch, nextNode)
  let emitCreatedBatch = (node: Node) => {
    node.onEntitiesIncluded.emit(event)
  }
  nextNode.traverseRem(emitCreatedBatch)
}

let emitIncludedEntities = (
  phase: string,
  batch: Set<Entity>,
  prevNode: Node,
  nextNode: Node,
) => {
  let event = makeTransactionEvent(phase, batch, nextNode)
  let emitIncludedBatch = (node: Node) => {
    node.onEntitiesIncluded.emit(event)
  }
  nextNode.traverseRemWithFilter(
    emitIncludedBatch,
    node => node !== prevNode && !prevNode.isSupersetOf(node),
  )
}

let emitExcludedEntities = (
  phase: string,
  batch: Set<Entity>,
  prevNode: Node,
  nextNode: Node,
) => {
  let event = makeTransactionEvent(phase, batch, prevNode)
  let emitExcludedBatch = (node: Node) => {
    node.onEntitiesExcluded.emit(event)
  }
  prevNode.traverseRemWithFilter(
    emitExcludedBatch,
    node => node !== nextNode && !node.isSupersetOf(nextNode),
  )
}

let emitMovedEntities = (
  phase: string,
  batch: Set<Entity>,
  prevNode: Node,
  nextNode: Node,
) => {
  let includedEvent = makeTransactionEvent(phase, batch, nextNode)
  let excludedEvent = makeTransactionEvent(phase, batch, prevNode)
  let emitIncludedBatch = (node: Node) => {
    node.onEntitiesIncluded.emit(includedEvent)
  }
  let emitExcludedBatch = (node: Node) => {
    node.onEntitiesIncluded.emit(excludedEvent)
  }
  nextNode.traverseRem(emitIncludedBatch)
  prevNode.traverseRem(emitExcludedBatch)
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

  drainEntities(graph: Graph, phase: string, iteratee?: TransactionIteratee) {
    let emitBatch = (batch: Set<Entity>, batchKey: bigint) => {
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
    }
    this.#entityBatches.forEach(emitBatch)
    this.#entityBatches.clear()
    this.#entityIndex.clear()
  }
}
