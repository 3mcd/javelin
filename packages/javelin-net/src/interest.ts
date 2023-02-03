import * as j from "@javelin/ecs"
import {ServerWorld} from "./client_resources.js"
import {MTU_SIZE} from "./const.js"
import {EntityEncoder} from "./encode.js"
import {NormalizedModel} from "./model.js"
import {makeMessage} from "./protocol.js"
import {Sendable} from "./sendable.js"
import {PriorityQueueInt} from "./structs/priority_queue_int.js"

export type PatchStage = []
export let PatchStage = j.resource<PatchStage>()

export type SubjectPrioritizer = (
  entity: j.Entity,
  subject: j.Entity,
  world: j.World,
) => number

let subjectComponents: j.Component[] = []

export let interestMessage = makeMessage({
  encode(stream, world: j.World, interest: InterestState) {
    let {localComponentsToIso} = world.getResource(NormalizedModel)
    let {subjectType} = interest
    let subjectComponents = subjectType.normalized.components
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectType)
    let mtuDiff = MTU_SIZE - stream.offset
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
    stream.grow(growAmount)
    // (1)
    stream.writeU8(subjectComponents.length)
    // (2)
    for (let i = 0; i < subjectComponents.length; i++) {
      let isoComponent = localComponentsToIso[subjectComponents[i]]
      stream.writeU32(isoComponent)
    }
    // (3)
    let subjectCount = 0
    let subjectCountOffset = stream.writeU16(0)
    while (stream.offset < MTU_SIZE && !interest.subjectQueue.isEmpty()) {
      let entity = interest.subjectQueue.pop()!
      // (4)
      subjectEncoder.encodeEntity(entity, stream)
      subjectCount++
    }
    stream.writeU16At(subjectCount, subjectCountOffset)
  },
  decode(stream, world) {
    let serverWorld = world.getResource(ServerWorld)
    let {isoComponentsToLocal} = world.getResource(NormalizedModel)
    // (1)
    let subjectComponentsLength = stream.readU8()
    subjectComponents.length = subjectComponentsLength
    // (2)
    for (let i = 0; i < subjectComponentsLength; i++) {
      let localComponent = isoComponentsToLocal[stream.readU32()]
      subjectComponents[i] = localComponent
    }
    let subjectType = j.type.apply(null, subjectComponents)
    let subjectEncoder = EntityEncoder.getEntityEncoder(
      serverWorld,
      subjectType,
    )
    // (3)
    let subjectCount = stream.readU16()
    // (4)
    for (let i = 0; i < subjectCount; i++) {
      subjectEncoder.decodeEntityUpdate(stream)
    }
  },
})

export interface InterestState extends Sendable {
  readonly subjectPrioritizer: SubjectPrioritizer
  readonly subjectType: j.Type
  readonly subjectQueue: PriorityQueueInt<j.Entity>
  step(world: j.World, entity: j.Entity, subjects: Set<j.Entity>): void
}

export class InterestStateImpl implements InterestState {
  readonly subjectPrioritizer
  readonly subjectQueue
  readonly subjectType

  sendRate
  lastSendTime

  constructor(
    subjectType: j.Type,
    subjectPrioritizer: SubjectPrioritizer,
    sendRate: number,
  ) {
    this.lastSendTime = 0
    this.sendRate = sendRate
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectQueue = new PriorityQueueInt<j.Entity>()
    this.subjectType = subjectType
  }

  step(world: j.World, entity: j.Entity, subjects: Set<j.Entity>) {
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

export interface Interest {
  readonly subjectPrioritizer: SubjectPrioritizer
  readonly subjectType: j.Type
  sendRate: number
  init(): InterestState
}

export class InterestImpl implements Interest {
  readonly subjectPrioritizer
  readonly subjectType

  sendRate

  constructor(
    subjectType: j.Type,
    subjectPrioritizer: SubjectPrioritizer,
    sendRate: number,
  ) {
    this.sendRate = sendRate
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectType = subjectType
  }

  init() {
    return new InterestStateImpl(
      this.subjectType,
      this.subjectPrioritizer,
      this.sendRate,
    )
  }
}

export let makeInterest = (
  subjectType: j.Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
): Interest => new InterestImpl(subjectType, subjectPrioritizer, 1 / 20)
