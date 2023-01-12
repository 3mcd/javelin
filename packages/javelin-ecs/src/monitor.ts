import {Entity} from "./entity.js"
import {Node} from "./graph.js"
import {Component} from "./component.js"
import {TransactionEvent} from "./transaction.js"

type MonitorIteratee = (entity: Entity) => void

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
    this.#excludedEntityBatches = [] as Set<Entity>[]
    this.#includedEntityBatches = [] as Set<Entity>[]
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
    for (let i = 0; i < this.#includedEntityBatches.length; i++) {
      let batch = this.#includedEntityBatches[i]
      batch.forEach(iteratee)
    }
    return this
  }

  eachExcluded(iteratee: MonitorIteratee) {
    for (let i = 0; i < this.#excludedEntityBatches.length; i++) {
      let batch = this.#excludedEntityBatches[i]
      batch.forEach(iteratee)
    }
    return this
  }

  get includedSize() {
    let size = 0
    for (let i = 0; i < this.#includedEntityBatches.length; i++) {
      size += this.#includedEntityBatches[i].size
    }
    return size
  }

  get excludedSize() {
    let size = 0
    for (let i = 0; i < this.#excludedEntityBatches.length; i++) {
      size += this.#excludedEntityBatches[i].size
    }
    return size
  }

  drain() {
    while (this.#includedEntityBatches.pop()) {}
    while (this.#excludedEntityBatches.pop()) {}
  }

  dispose() {
    this.#unsubscribeEntitiesIncluded()
    this.#unsubscribeEntitiesExcluded()
  }
}
