import {Entity, QuerySelector, World} from "@javelin/ecs"
import {EntityEncoder} from "./encode.js"
import {PriorityQueueInt} from "./priority_queue_int.js"
import {ProtocolMessageType} from "./protocol.js"

export type SubjectPrioritizer = (
  entity: Entity,
  subject: Entity,
  world: World,
) => number

export let interestMessageType: ProtocolMessageType<Interest> = {
  encode(writeStream, world, interest) {
    let {subjectSelector} = interest
    let subjectQuery = world.of(subjectSelector)
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectSelector)
    writeStream.grow(4 + subjectQuery.length * subjectEncoder.bytesPerEntity)
  },
  decode(readStream, world) {},
}

export class Interest {
  readonly subjectPriorities
  readonly subjectPrioritizer
  readonly subjectSelector

  constructor(
    subjectSelector: QuerySelector,
    subjectPrioritizer: SubjectPrioritizer,
  ) {
    this.subjectPriorities = new PriorityQueueInt<Entity>()
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectSelector = subjectSelector
  }
}
