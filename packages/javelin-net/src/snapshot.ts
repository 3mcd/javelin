import * as j from "@javelin/ecs"
import {exists} from "@javelin/lib"
import {MTU_SIZE, SNAPSHOT_SEND_PERIOD} from "./const.js"
import {EntityEncoder} from "./encode.js"
import {SubjectPrioritizer} from "./interest.js"
import {NormalizedNetworkModel} from "./model.js"
import {PredictionScopes} from "./prediction_resources.js"
import {makePredictionScope} from "./prediction_scope.js"
import {makeMessage} from "./protocol.js"
import {Sendable} from "./sendable.js"
import {PriorityQueueInt} from "./structs/priority_queue_int.js"
import {ReadStream} from "./structs/stream.js"

let subjectComponents: j.Component[] = []

export let snapshotMessage = makeMessage({
  encode(
    stream,
    world: j.World,
    interest: SnapshotInterestState,
    timestamp: number,
  ) {
    let mtuDiff = MTU_SIZE - stream.offset
    if (mtuDiff <= 0) {
      return
    }
    let {localComponentsToIso} = world.getResource(NormalizedNetworkModel)
    let {subjectType} = interest
    let subjectComponents = subjectType.normalized.components
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectType)
    let growAmount =
      4 + // timestamp
      1 + // subject type length
      2 + // subject count
      subjectType.normalized.components.length * 4 +
      Math.min(
        mtuDiff,
        interest.subjectQueue.length * subjectEncoder.bytesPerEntity,
      )
    stream.grow(growAmount)
    stream.writeU32(timestamp)
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
    let predictionScopes = world.getResource(PredictionScopes)
    let {isoComponentsToLocal} = world.getResource(NormalizedNetworkModel)
    let snapshotTimestamp = stream.readU32() as number
    let subjectComponentsLength = stream.readU8()
    subjectComponents.length = subjectComponentsLength
    for (let i = 0; i < subjectComponentsLength; i++) {
      let localComponent = isoComponentsToLocal[stream.readU32()]
      subjectComponents[i] = localComponent
    }
    let type = j.type.apply(null, subjectComponents)
    let scope = predictionScopes.get(type.hash)
    if (!exists(scope)) {
      scope = makePredictionScope(type)
      predictionScopes.set(type.hash, scope)
    }
    scope.snapshots.insert(stream.into(length), snapshotTimestamp)
  },
})

export let decodeSnapshot = (
  world: j.World,
  stream: ReadStream,
  type: j.Type,
  entities: Set<j.Entity>,
) => {
  let subjectEncoder = EntityEncoder.getEntityEncoder(world, type)
  let subjectCount = stream.readU16()
  for (let i = 0; i < subjectCount; i++) {
    subjectEncoder.decodeEntityUpdate(stream, entities)
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
    world.monitorImmediate(this.subjectType).eachExcluded(subject => {
      this.subjectQueue.remove(subject)
    })
    world.query(this.subjectType).each(subject => {
      if (subjects.has(subject)) {
        let currSubjectPriority = this.subjectQueue.getPriority(subject)
        let nextSubjectPriority =
          (currSubjectPriority ?? 0) +
          this.subjectPrioritizer(entity, subject, world)
        this.subjectQueue.push(subject, nextSubjectPriority)
      } else {
        this.subjectQueue.remove(subject)
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
  new SnapshotInterestImpl(
    subjectType,
    subjectPrioritizer,
    SNAPSHOT_SEND_PERIOD,
  )
