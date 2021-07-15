import { Entity } from "@javelin/ecs"
import { Comparator } from "./comparator"
import { createEntityMap } from "./entity_map"
import { MinHeap } from "./min_heap"

export default class EntityPriorityQueue extends MinHeap<Entity> {
  private priorities = createEntityMap<number>()
  private valueComparator = new Comparator(this.compareValue)

  constructor() {
    super()
    this.compare = new Comparator(this.comparePriority.bind(this))
  }

  add(entity: Entity, priority = 0) {
    this.priorities[entity] = priority
    super.add(entity)
    return this
  }

  remove(entity: Entity, customFindingComparator?: Comparator<Entity>) {
    super.remove(entity, customFindingComparator)
    delete this.priorities[entity]
    return this
  }

  getPriority(entity: Entity) {
    return this.priorities[entity]
  }

  changePriority(entity: Entity, priority: number) {
    this.remove(entity, this.valueComparator)
    this.add(entity, priority)
    return this
  }

  findByValue(entity: Entity) {
    return this.find(entity, this.valueComparator)
  }

  hasValue(entity: Entity) {
    return this.findByValue(entity).length > 0
  }

  comparePriority(a: Entity, b: Entity) {
    if (this.priorities[a] === this.priorities[b]) {
      return 0
    }
    return this.priorities[a]! > this.priorities[b]! ? -1 : 1
  }

  compareValue(a: Entity, b: Entity) {
    if (a === b) {
      return 0
    }
    return a < b ? -1 : 1
  }

  poll() {
    const entity = super.poll()
    if (entity !== null) {
      delete this.priorities[entity]
    }
    return entity
  }
}
