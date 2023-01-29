import {
  Component,
  Entity,
  QuerySelector,
  resource,
  type,
  World,
} from "@javelin/ecs"
import {EntityEncoder} from "./encode.js"
import {PriorityQueueInt} from "./priority_queue_int.js"
import {ProtocolMessageType} from "./protocol.js"

const MTU_SIZE = 1_300

export type PatchStage = []
export let PatchStage = resource<PatchStage>()

export type SubjectPrioritizer = (
  entity: Entity,
  subject: Entity,
  world: World,
) => number

export let interestMessageType: ProtocolMessageType<Interest> = {
  encode(writeStream, world, interest) {
    let {subjectSelector} = interest
    let subjectComponents = interest.subjectSelector.type.components
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectSelector)
    let mtuDiff = MTU_SIZE - writeStream.offset
    if (mtuDiff <= 0) {
      return
    }
    let growAmount =
      1 +
      2 +
      subjectSelector.type.components.length * 4 +
      Math.min(
        mtuDiff,
        interest.subjectQueue.length * subjectEncoder.bytesPerEntity,
      )
    writeStream.grow(growAmount)
    // (1)
    writeStream.writeU8(subjectComponents.length)
    // (2)
    for (let i = 0; i < subjectComponents.length; i++) {
      writeStream.writeU32(subjectComponents[i])
    }
    // (3)
    let subjectCount = 0
    let subjectCountOffset = writeStream.writeU16(0)
    while (writeStream.offset < MTU_SIZE && !interest.subjectQueue.isEmpty()) {
      let entity = interest.subjectQueue.pop()!
      // (4)
      subjectEncoder.encode(entity, writeStream)
      subjectCount++
    }
    writeStream.writeU16At(subjectCount, subjectCountOffset)
  },
  decode(readStream, world) {
    // (1)
    let subjectComponentsLength = readStream.readU8()
    // (2)
    let subjectComponents: Component[] = []
    for (let i = 0; i < subjectComponentsLength; i++) {
      subjectComponents.push(readStream.readU32() as Component)
    }
    let subjectSelector = type.apply(null, subjectComponents)
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectSelector)
    // (3)
    let subjectCount = readStream.readU16()
    // (4)
    for (let i = 0; i < subjectCount; i++) {
      subjectEncoder.decodePatch(readStream)
    }
  },
}

export class Interest {
  readonly entity: Entity
  readonly subjectQueue
  readonly subjectPrioritizer
  readonly subjectSelector

  constructor(
    entity: Entity,
    subjectSelector: QuerySelector,
    subjectPrioritizer: SubjectPrioritizer,
  ) {
    this.entity = entity
    this.subjectQueue = new PriorityQueueInt<Entity>()
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectSelector = subjectSelector
  }
}

export let makeInterest = (
  entity: Entity,
  subjectSelector: QuerySelector,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
) => new Interest(entity, subjectSelector, subjectPrioritizer)
