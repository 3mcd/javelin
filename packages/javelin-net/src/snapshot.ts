import * as j from "@javelin/ecs"
import {exists} from "@javelin/lib"
import {MTU_SIZE} from "./const.js"
import {EntityEncoder} from "./encode.js"
import {SubjectPrioritizer} from "./interest.js"
import {NormalizedModel} from "./model.js"
import {ServerSnapshots} from "./prediction_resources.js"
import {PredictionSnapshotsImpl} from "./prediction_snapshots.js"
import {makeMessage} from "./protocol.js"
import {Sendable} from "./sendable.js"
import {PriorityQueueInt} from "./structs/priority_queue_int.js"
import {ReadStream} from "./structs/stream.js"
import {makeTimestampFromTime, Timestamp} from "./timestamp.js"

let subjectComponents: j.Component[] = []

export let snapshotMessage = makeMessage({
  encode(stream, world: j.World, interest: SnapshotInterestState) {
    let mtuDiff = MTU_SIZE - stream.offset
    if (mtuDiff <= 0) {
      return
    }
    let time = world.getResource(j.Time)
    let {localComponentsToIso} = world.getResource(NormalizedModel)
    let {subjectType} = interest
    let subjectComponents = subjectType.normalized.components
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectType)
    let growAmount =
      2 + // timestamp
      1 + // subject type length
      2 + // subject count
      subjectType.normalized.components.length * 4 +
      Math.min(
        mtuDiff,
        interest.subjectQueue.length * subjectEncoder.bytesPerEntity,
      )
    stream.grow(growAmount)
    stream.writeI16(makeTimestampFromTime(time.currentTime, 1 / 60))
    stream.writeU8(subjectComponents.length)
    for (let i = 0; i < subjectComponents.length; i++) {
      let isoComponent = localComponentsToIso[subjectComponents[i]]
      stream.writeU32(isoComponent)
    }
    let subjectCount = 0
    let subjectCountOffset = stream.writeU16(0)
    while (stream.offset < MTU_SIZE && !interest.subjectQueue.isEmpty()) {
      let entity = interest.subjectQueue.pop()!
      subjectEncoder.encodeEntity(entity, stream)
      subjectCount++
    }
    stream.writeU16At(subjectCount, subjectCountOffset)
  },
  decode(stream, world, _, length) {
    let snapshots = world.getResource(ServerSnapshots)
    let {isoComponentsToLocal} = world.getResource(NormalizedModel)
    let snapshotTimestamp = stream.readI16() as Timestamp
    let subjectComponentsLength = stream.readU8()
    subjectComponents.length = subjectComponentsLength
    for (let i = 0; i < subjectComponentsLength; i++) {
      let localComponent = isoComponentsToLocal[stream.readU32()]
      subjectComponents[i] = localComponent
    }
    let subjectType = j.type.apply(null, subjectComponents)
    let subjectSnapshots = snapshots.get(subjectType.hash)
    if (!exists(subjectSnapshots)) {
      subjectSnapshots = new PredictionSnapshotsImpl(subjectType)
      snapshots.set(subjectType.hash, subjectSnapshots)
    }
    subjectSnapshots.insert(stream.into(length), snapshotTimestamp)
  },
})

export let decodeSnapshot = (
  world: j.World,
  stream: ReadStream,
  type: j.Type,
) => {
  let subjectEncoder = EntityEncoder.getEntityEncoder(world, type)
  let subjectCount = stream.readU16()
  for (let i = 0; i < subjectCount; i++) {
    subjectEncoder.decodeEntityUpdate(stream)
  }
}

export interface SnapshotInterestState extends Sendable {
  readonly subjectPrioritizer: SubjectPrioritizer
  readonly subjectType: j.Type
  readonly subjectQueue: PriorityQueueInt<j.Entity>
  step(world: j.World, entity: j.Entity, subjects: Set<j.Entity>): void
}

export class SnapshotInterestStateImpl implements SnapshotInterestState {
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
    world.query(this.subjectType).each(subject => {
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

export interface SnapshotInterest {
  readonly subjectPrioritizer: SubjectPrioritizer
  readonly subjectType: j.Type
  sendRate: number
  init(): SnapshotInterestState
}

export class SnapshotInterestImpl implements SnapshotInterest {
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
    return new SnapshotInterestStateImpl(
      this.subjectType,
      this.subjectPrioritizer,
      this.sendRate,
    )
  }
}

export let makeSnapshotInterest = (
  subjectType: j.Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
): SnapshotInterest =>
  new SnapshotInterestImpl(subjectType, subjectPrioritizer, 1 / 20)
