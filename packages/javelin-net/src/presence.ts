import * as j from "@javelin/ecs"
import {_commitStagedChanges, _emitStagedChanges} from "@javelin/ecs"
import {ServerWorld} from "./client_resources.js"
import {MTU_SIZE} from "./const.js"
import {EntityEncoder} from "./encode.js"
import {SubjectPrioritizer} from "./interest.js"
import {NormalizedNetworkModel} from "./model.js"
import {CorrectedWorld, PredictedWorld} from "./prediction_resources.js"
import {makeMessage} from "./protocol.js"
import {Sendable} from "./sendable.js"
import {PriorityQueueInt} from "./structs/priority_queue_int.js"
import {WriteStream} from "./structs/stream.js"

let subjectComponents: j.Component[] = []

/**
 * Encodes and decodes entity presence messages.
 */
export let presenceMessage = makeMessage({
  encode(stream, world: j.World, presence: PresenceState) {
    let {localComponentsToIso} = world.getResource(NormalizedNetworkModel)
    let {subjectType} = presence
    let subjectComponents = subjectType.normalized.components
    let excludedSubjectCount = presence.excludedSubjectQueue.length
    let includedSubjectCount = presence.includedSubjectQueue.length
    if (includedSubjectCount === 0 && excludedSubjectCount === 0) {
      return
    }
    let mtuDiff = MTU_SIZE - stream.offset
    if (mtuDiff <= 0) {
      return
    }
    grow: {
      let growAmount =
        1 + // components length
        2 + // subject count
        subjectComponents.length * 4 +
        Math.min(mtuDiff, excludedSubjectCount * 4 + includedSubjectCount * 4)
      stream.grow(growAmount)
    }
    components: {
      stream.writeU8(subjectComponents.length)
      for (let i = 0; i < subjectComponents.length; i++) {
        stream.writeU32(localComponentsToIso[subjectComponents[i]])
      }
    }
    excluded_subjects: {
      let excludedSubjectCount = 0
      let excludedSubjectCountOffset = stream.writeU16(0)
      while (
        stream.offset < MTU_SIZE &&
        !presence.excludedSubjectQueue.isEmpty()
      ) {
        let subject = presence.excludedSubjectQueue.pop()!
        // (4)
        stream.writeU32(subject)
        excludedSubjectCount++
      }
      stream.writeU16At(excludedSubjectCount, excludedSubjectCountOffset)
    }
    included_subjects: {
      let includedSubjectCount = 0
      let includedSubjectCountOffset = stream.writeU16(0)
      while (
        stream.offset < MTU_SIZE &&
        !presence.includedSubjectQueue.isEmpty()
      ) {
        let subject = presence.includedSubjectQueue.pop()!
        // (4)
        stream.writeU32(subject)
        includedSubjectCount++
      }
      stream.writeU16At(includedSubjectCount, includedSubjectCountOffset)
    }
  },
  decode(stream, world) {
    let predictedWorld = world.getResource(PredictedWorld)
    let correctedWorld = world.getResource(CorrectedWorld)
    let {isoComponentsToLocal} = world.getResource(NormalizedNetworkModel)
    let subjectComponentsLength = stream.readU8()
    subjectComponents.length = subjectComponentsLength
    for (let i = 0; i < subjectComponentsLength; i++) {
      subjectComponents[i] = isoComponentsToLocal[stream.readU32()]
    }
    let subjectType = j.type.apply(null, subjectComponents)
    let predictedWorldSubjectEncoder = EntityEncoder.getEntityEncoder(
      predictedWorld,
      subjectType,
    )
    let correctedWorldSubjectEncoder = EntityEncoder.getEntityEncoder(
      correctedWorld,
      subjectType,
    )
    excluded_subjects: {
      let excludedSubjectCount = stream.readU16()
      for (let i = 0; i < excludedSubjectCount; i++) {
        let excludedSubject = stream.readU32() as j.Entity
        predictedWorld.remove(excludedSubject, subjectType)
        correctedWorld.remove(excludedSubject, subjectType)
      }
    }
    included_subjects: {
      let includedSubjectCount = stream.readU16()
      let offset = stream.offset
      for (let i = 0; i < includedSubjectCount; i++) {
        predictedWorldSubjectEncoder.decodeEntityPresence(stream)
      }
      stream.offset = offset
      for (let i = 0; i < includedSubjectCount; i++) {
        correctedWorldSubjectEncoder.decodeEntityPresence(stream)
      }
    }
    correctedWorld[_emitStagedChanges]()
    correctedWorld[_commitStagedChanges]()
    predictedWorld[_emitStagedChanges]()
    predictedWorld[_commitStagedChanges]()
  },
})

export interface PresenceState extends Sendable {
  readonly excludedSubjectQueue: PriorityQueueInt<j.Entity>
  readonly includedSubjectQueue: PriorityQueueInt<j.Entity>
  readonly subjectPrioritizer: SubjectPrioritizer
  readonly subjectType: j.Type
  step(
    world: j.World,
    entity: j.Entity,
    subjects: Set<j.Entity>,
    stream: WriteStream,
  ): void
}

export class PresenceStateImpl implements PresenceState {
  #new

  readonly excludedSubjectQueue
  readonly includedSubjectQueue
  readonly subjectPrioritizer
  readonly subjectType

  lastSendTime
  sendRate

  constructor(
    subjectType: j.Type,
    subjectPrioritizer: SubjectPrioritizer,
    sendRate: number,
  ) {
    this.#new = true
    this.excludedSubjectQueue = new PriorityQueueInt<j.Entity>()
    this.includedSubjectQueue = new PriorityQueueInt<j.Entity>()
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectType = subjectType
    this.lastSendTime = 0
    this.sendRate = sendRate
  }

  step(world: j.World, entity: j.Entity, subjects: Set<j.Entity>) {
    if (this.#new) {
      world.query(this.subjectType).each(subject => {
        let subjectPriority = this.subjectPrioritizer(entity, subject, world)
        subjects.add(subject)
        this.includedSubjectQueue.push(subject, subjectPriority)
      })
      this.#new = false
    } else {
      world.monitor(this.subjectType).eachIncluded(subject => {
        let subjectPriority = this.subjectPrioritizer(entity, subject, world)
        subjects.add(subject)
        this.includedSubjectQueue.push(subject, subjectPriority)
        this.excludedSubjectQueue.remove(subject)
      })
      world.monitorImmediate(this.subjectType).eachExcluded(subject => {
        let subjectPriority = this.subjectPrioritizer(entity, subject, world)
        subjects.delete(subject)
        this.includedSubjectQueue.remove(subject)
        this.excludedSubjectQueue.push(subject, subjectPriority)
      })
    }
    subjects.forEach(subject => {
      let subjectPriority = this.subjectPrioritizer(entity, subject, world)
      if (subjectPriority <= 0) {
        this.includedSubjectQueue.remove(subject)
      }
    })
  }
}

export interface Presence {
  readonly subjectPrioritizer: SubjectPrioritizer
  readonly subjectType: j.Type
  sendRate: number
  init(): PresenceState
}

export class PresenceImpl implements Presence {
  readonly subjectPrioritizer
  readonly subjectType

  sendRate

  constructor(
    subjectType: j.Type,
    subjectPrioritizer: SubjectPrioritizer,
    sendRate: number,
  ) {
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectType = subjectType
    this.sendRate = sendRate
  }

  init() {
    return new PresenceStateImpl(
      this.subjectType,
      this.subjectPrioritizer,
      this.sendRate,
    )
  }
}

export let makePresence = (
  subjectType: j.Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
): Presence => new PresenceImpl(subjectType, subjectPrioritizer, 1 / 20)
