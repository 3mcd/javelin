import * as j from "@javelin/ecs"
import {MTU_SIZE} from "./const.js"
import {EntityEncoder} from "./encode.js"
import {NormalizedNetworkModel} from "./network_model.js"
import {ProtocolMessageType} from "./protocol.js"
import {PriorityQueueInt} from "./structs/priority_queue_int.js"

export type PatchStage = []
export let PatchStage = j.resource<PatchStage>()

export type SubjectPrioritizer = (
  entity: j.Entity,
  subject: j.Entity,
  world: j.World,
) => number

let subjectComponents: j.Component[] = []

export let interestMessageType: ProtocolMessageType<InterestStateImpl> = {
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
    let {isoComponentsToLocal} = world.getResource(NormalizedNetworkModel)
    // (1)
    let subjectComponentsLength = readStream.readU8()
    subjectComponents.length = subjectComponentsLength
    // (2)
    for (let i = 0; i < subjectComponentsLength; i++) {
      let localComponent = isoComponentsToLocal[readStream.readU32()]
      subjectComponents[i] = localComponent
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

export interface InterestState {
  readonly subjectPrioritizer: SubjectPrioritizer
  readonly subjectQueue: PriorityQueueInt<j.Entity>
  readonly subjectType: j.Type
}

export class InterestStateImpl implements InterestState {
  readonly subjectPrioritizer
  readonly subjectQueue
  readonly subjectType

  constructor(subjectType: j.Type, subjectPrioritizer: SubjectPrioritizer) {
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectQueue = new PriorityQueueInt<j.Entity>()
    this.subjectType = subjectType
  }

  prioritize(world: j.World, entity: j.Entity, subjects: Set<j.Entity>) {
    world.of(this.subjectType).each(subject => {
      if (!subjects.has(subject)) {
        this.subjectQueue.remove(subject)
      } else {
        let currSubjectPriority = this.subjectQueue.getPriority(subject)
        let nextSubjectPriority =
          (currSubjectPriority ?? 0) +
          this.subjectPrioritizer(entity, subject, world)
        this.subjectQueue.push(subject, nextSubjectPriority)
      }
    })
  }
}

export class Interest {
  readonly subjectPrioritizer
  readonly subjectType

  constructor(subjectType: j.Type, subjectPrioritizer: SubjectPrioritizer) {
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectType = subjectType
  }

  init() {
    return new InterestStateImpl(this.subjectType, this.subjectPrioritizer)
  }
}

export let makeInterest = (
  subjectType: j.Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
) => new Interest(subjectType, subjectPrioritizer)
