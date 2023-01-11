import {Entity} from "./entity.js"
import {Node} from "./graph.js"
import {Component} from "./term.js"
import {TransactionEvent} from "./transaction.js"

type MonitorIteratee = (entity: number) => void

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
  #excluded_components
  #excluded_entity_batches
  #included_entity_batches
  #phase
  #unsubscribe_entities_included
  #unsubscribe_entities_excluded

  constructor(
    node: Node,
    phase: string,
    excluded_components: Component[] = [],
  ) {
    this.#excluded_components = excluded_components
    this.#excluded_entity_batches = new MonitorBatchBuffer()
    this.#included_entity_batches = new MonitorBatchBuffer()
    this.#phase = phase
    node.traverse_add(node => {
      if (this.#matches_node(node)) {
        this.#include_batch(new Set(node.entities))
      }
    })
    this.#unsubscribe_entities_included =
      node.on_entities_included.add(event =>
        this.#handle_include_event(event),
      )
    this.#unsubscribe_entities_excluded =
      node.on_entities_excluded.add(event =>
        this.#handle_exclude_event(event),
      )
  }

  #matches_event(event: TransactionEvent) {
    return (
      this.#phase === event.phase && this.#matches_node(event.node)
    )
  }

  #matches_node(node: Node) {
    for (let i = 0; i < this.#excluded_components.length; i++) {
      let term = this.#excluded_components[i]
      if (node.has_component(term)) {
        return false
      }
    }
    return true
  }

  #include_batch(batch: Set<Entity>) {
    this.#included_entity_batches.push(batch)
  }

  #handle_include_event(event: TransactionEvent) {
    if (this.#matches_event(event)) {
      this.#included_entity_batches.push(event.batch)
    }
  }

  #handle_exclude_event(event: TransactionEvent) {
    if (this.#matches_event(event)) {
      this.#excluded_entity_batches.push(event.batch)
    }
  }

  each_included(iteratee: MonitorIteratee) {
    let batches = this.#included_entity_batches.get()
    for (let i = 0; i < batches.length; i++) {
      let batch = batches[i]
      batch.forEach(iteratee)
    }
    return this
  }

  each_excluded(iteratee: MonitorIteratee) {
    let batches = this.#excluded_entity_batches.get()
    for (let i = 0; i < batches.length; i++) {
      let batch = batches[i]
      batch.forEach(iteratee)
    }
    return this
  }

  get included_size() {
    let batches = this.#included_entity_batches.get()
    let size = 0
    for (let i = 0; i < batches.length; i++) {
      size += batches[i].size
    }
    return size
  }

  get excluded_size() {
    let batches = this.#excluded_entity_batches.get()
    let size = 0
    for (let i = 0; i < batches.length; i++) {
      size += batches[i].size
    }
    return size
  }

  drain() {
    this.#included_entity_batches.swap()
    this.#excluded_entity_batches.swap()
  }

  dispose() {
    this.#unsubscribe_entities_included()
    this.#unsubscribe_entities_excluded()
  }
}
