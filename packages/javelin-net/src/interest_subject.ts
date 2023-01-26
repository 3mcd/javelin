import {Entity, Selector, World} from "@javelin/ecs"
import * as PriorityQueueInt from "./priority_queue_int.js"

type EntityPrioritySetter = (
  entity: Entity,
  subject: Entity,
  world: World,
) => number

export type T = {
  entity_priority_queue: PriorityQueueInt.T
  entity_priority_setter: EntityPrioritySetter
  entity_subject: Selector
}

export let make = (
  entity_subject: Selector,
  entity_priority_setter: EntityPrioritySetter,
): T => {
  return {
    entity_priority_queue: PriorityQueueInt.make(20_000),
    entity_priority_setter,
    entity_subject,
  }
}

export let update = (t: T, entity: Entity, world: World) => {
  world
    .monitor(t.entity_subject)
    .eachIncluded(subject => {
      PriorityQueueInt.push(t.entity_priority_queue, subject, 0)
    })
    .eachExcluded(subject => {
      PriorityQueueInt.remove(t.entity_priority_queue, subject)
    })
  world.of(t.entity_subject).each(subject => {
    PriorityQueueInt.push(
      t.entity_priority_queue,
      subject,
      t.entity_priority_setter(entity, subject, world),
    )
  })
}
