import {
  Component,
  Entity,
  Selector,
  Type,
  type,
  World,
} from "@javelin/ecs"
import {ReadStream} from "./read_stream.js"
import {WriteStream} from "./write_stream.js"
import * as PriorityQueueInt from "./priority_queue_int.js"

const Ignore = Symbol()
type Ignore = typeof Ignore

type InterestPrioritySetter = (
  subject: Entity,
  object: Entity,
  world: World,
) => number | Ignore

type T = {
  readonly entity: Entity
  readonly entity_subjects: Selector[]
  readonly meta_length: number
  readonly priority_queue: PriorityQueueInt.T
  readonly priority_setter?: InterestPrioritySetter
}

/**
 * Encodes and decodes entity interest messages.
 */
export let messageType = {
  encode(stream: WriteStream, world: World, interest: T) {
    stream.grow(interest.meta_length)
    for (let i = 0; i < interest.entity_subjects.length; i++) {}
  },
  decode(stream: ReadStream, world: World) {},
}

let make = (
  entity: Entity,
  entity_subjects: Selector[],
  prioritize?: InterestPrioritySetter,
): T => {
  let meta_length = 4
  for (let subject of entity_subjects) {
    meta_length += subject.includedComponents.length * 4
  }
  return {
    meta_length,
    priority_setter: prioritize,
    priority_queue: PriorityQueueInt.make(20_000),
    entity,
    entity_subjects,
  }
}

let update_priorities = (t: T, world: World) => {
  for (let i = 0; i < t.entity_subjects.length; i++) {
    let subject = t.entity_subjects[i]
    let subject_query = world.of(subject)
    let subject_monitor = world.monitor(subject)
    subject_monitor.eachIncluded(entity => {
      PriorityQueueInt.push(t.priority_queue, entity, 0)
    })
    subject_monitor.eachExcluded(entity => {
      PriorityQueueInt.remove(t.priority_queue, entity)
    })
    subject_query.each(entity => {
      let entity_priority =
        t.priority_setter?.(t.entity, entity, world) ?? 0
      PriorityQueueInt.push(
        t.priority_queue,
        entity,
        entity_priority === Ignore ? -Infinity : entity_priority,
      )
    })
  }
}
