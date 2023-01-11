import {Entity} from "./entity.js"
import {Node} from "./graph.js"
import {Component} from "./term.js"
import {TransactionEvent} from "./transaction.js"

type MonitorIteratee = (entity: Entity) => void

class MonitorBatchBuffer {
  #old
  #new

  constructor() {
    this.#old = [] as Set<Entity>[]
    this.#new = [] as Set<Entity>[]
  }

  swap() {
    let ready = this.#old
    this.#old = this.#new
    this.#new = ready
    while (ready.length > 0) {
      ready.pop()
    }
  }

  push(batch: Set<Entity>) {
    this.#new.push(batch)
  }

  get() {
    return this.#old
  }
}

export class Monitor {
  #excludedComponents
  #excludedEntityBatches
  #includedEntityBatches
  #phase
  #unsubscribeEntitiesIncluded
  #unsubscribeEntitiesExcluded

  constructor(
    node: Node,
    phase: string,
    excludedComponents: Component[] = [],
  ) {
    this.#excludedComponents = excludedComponents
    this.#excludedEntityBatches = new MonitorBatchBuffer()
    this.#includedEntityBatches = new MonitorBatchBuffer()
    this.#phase = phase
    node.traverseAdd(node => {
      if (this.#matchesNode(node)) {
        this.#includeBatch(new Set(node.entities))
      }
    })
    this.#unsubscribeEntitiesIncluded = node.onEntitiesIncluded.add(
      event => this.#handleIncludeEvent(event),
    )
    this.#unsubscribeEntitiesExcluded = node.onEntitiesExcluded.add(
      event => this.#handleExcludeEvent(event),
    )
  }

  #matchesEvent(event: TransactionEvent) {
    return (
      this.#phase === event.phase && this.#matchesNode(event.node)
    )
  }

  #matchesNode(node: Node) {
    for (let i = 0; i < this.#excludedComponents.length; i++) {
      let term = this.#excludedComponents[i]
      if (node.hasComponent(term)) {
        return false
      }
    }
    return true
  }

  #includeBatch(batch: Set<Entity>) {
    this.#includedEntityBatches.push(batch)
  }

  #handleIncludeEvent(event: TransactionEvent) {
    if (this.#matchesEvent(event)) {
      this.#includedEntityBatches.push(event.batch)
    }
  }

  #handleExcludeEvent(event: TransactionEvent) {
    if (this.#matchesEvent(event)) {
      this.#excludedEntityBatches.push(event.batch)
    }
  }

  eachIncluded(iteratee: MonitorIteratee) {
    let batches = this.#includedEntityBatches.get()
    for (let i = 0; i < batches.length; i++) {
      let batch = batches[i]
      batch.forEach(iteratee)
    }
    return this
  }

  eachExcluded(iteratee: MonitorIteratee) {
    let batches = this.#excludedEntityBatches.get()
    for (let i = 0; i < batches.length; i++) {
      let batch = batches[i]
      batch.forEach(iteratee)
    }
    return this
  }

  get includedSize() {
    let batches = this.#includedEntityBatches.get()
    let size = 0
    for (let i = 0; i < batches.length; i++) {
      size += batches[i].size
    }
    return size
  }

  get excludedSize() {
    let batches = this.#excludedEntityBatches.get()
    let size = 0
    for (let i = 0; i < batches.length; i++) {
      size += batches[i].size
    }
    return size
  }

  drain() {
    this.#includedEntityBatches.swap()
    this.#excludedEntityBatches.swap()
  }

  dispose() {
    this.#unsubscribeEntitiesIncluded()
    this.#unsubscribeEntitiesExcluded()
  }
}
