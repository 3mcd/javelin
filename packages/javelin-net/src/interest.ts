import * as j from "@javelin/ecs"
import {EntityEncoder} from "./encode.js"
import {NormalizedNetworkModel} from "./network_model.js"
import {ProtocolMessageType} from "./protocol.js"
import {PriorityQueueInt} from "./structs/priority_queue_int.js"

const MTU_SIZE = 1_200

export type PatchStage = []
export let PatchStage = j.resource<PatchStage>()

export type SubjectPrioritizer = (
  entity: j.Entity,
  subject: j.Entity,
  world: j.World,
) => number

export let interestMessageType: ProtocolMessageType<Interest> = {
  encode(writeStream, world, interest) {
    let {localComponentsToIso} = world.getResource(NormalizedNetworkModel)
    let {subjectType} = interest
    let subjectComponents = subjectType.normalized.components
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectType)
    let mtuDiff = MTU_SIZE - writeStream.offset
    if (mtuDiff <= 0) {
      return
    }
    let growAmount =
      1 +
      2 +
      subjectType.normalized.components.length * 4 +
      Math.min(
        mtuDiff,
        interest.subjectQueue.length * subjectEncoder.bytesPerEntity,
      )
    writeStream.grow(growAmount)
    // (1)
    writeStream.writeU8(subjectComponents.length)
    // (2)
    for (let i = 0; i < subjectComponents.length; i++) {
      let isoComponent = localComponentsToIso[subjectComponents[i]]
      writeStream.writeU32(isoComponent)
    }
    // (3)
    let subjectCount = 0
    let subjectCountOffset = writeStream.writeU16(0)
    while (writeStream.offset < MTU_SIZE && !interest.subjectQueue.isEmpty()) {
      let entity = interest.subjectQueue.pop()!
      // (4)
      subjectEncoder.encodeEntity(entity, writeStream)
      subjectCount++
    }
    writeStream.writeU16At(subjectCount, subjectCountOffset)
  },
  decode(readStream, world) {
    let {localComponents} = world.getResource(NormalizedNetworkModel)
    // (1)
    let subjectComponentsLength = readStream.readU8()
    // (2)
    let subjectComponents: j.Component[] = []
    for (let i = 0; i < subjectComponentsLength; i++) {
      let localComponent = localComponents[readStream.readU32()]
      subjectComponents.push(localComponent)
    }
    let subjectType = j.type.apply(null, subjectComponents)
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectType)
    // (3)
    let subjectCount = readStream.readU16()
    // (4)
    for (let i = 0; i < subjectCount; i++) {
      subjectEncoder.decodeEntityUpdate(readStream)
    }
  },
}

export class Interest {
  readonly entity: j.Entity
  readonly subjectQueue
  readonly subjectPrioritizer
  readonly subjectType

  constructor(
    entity: j.Entity,
    subjectType: j.Type,
    subjectPrioritizer: SubjectPrioritizer,
  ) {
    this.entity = entity
    this.subjectQueue = new PriorityQueueInt<j.Entity>()
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectType = subjectType
  }

  prioritize(world: j.World) {
    world.of(this.subjectType).each(subject => {
      let currSubjectPriority = this.subjectQueue.getPriority(subject)
      let nextSubjectPriority =
        (currSubjectPriority ?? 0) +
        this.subjectPrioritizer(this.entity, subject, world)
      this.subjectQueue.push(subject, nextSubjectPriority)
    })
  }
}

export let makeInterest = (
  entity: j.Entity,
  subjectType: j.Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
) => new Interest(entity, subjectType, subjectPrioritizer)
