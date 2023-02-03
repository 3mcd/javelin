import * as j from "@javelin/ecs"
import {ServerWorld} from "./client_resources.js"
import {MTU_SIZE} from "./const.js"
import {EntityEncoder} from "./encode.js"
import {SubjectPrioritizer} from "./interest.js"
import {NormalizedModel} from "./model.js"
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
    let {localComponentsToIso} = world.getResource(NormalizedModel)
    let {subjectType} = presence
    let subjectComponents = subjectType.normalized.components
    let subjectQueueLength = presence.subjectQueue.length
    if (subjectQueueLength === 0) {
      return
    }
    let mtuDiff = MTU_SIZE - stream.offset
    if (mtuDiff <= 0) {
      return
    }
    let growAmount =
      1 + // components length
      2 + // subject count
      subjectComponents.length * 4 +
      Math.min(mtuDiff, subjectQueueLength * 4)
    stream.grow(growAmount)
    // (1)
    stream.writeU8(subjectComponents.length)
    // (2)
    for (let i = 0; i < subjectComponents.length; i++) {
      stream.writeU32(localComponentsToIso[subjectComponents[i]])
    }
    // (3)
    let subjectCount = 0
    let subjectCountOffset = stream.writeU16(0)
    while (stream.offset < MTU_SIZE && !presence.subjectQueue.isEmpty()) {
      let subject = presence.subjectQueue.pop()!
      // (4)
      stream.writeU32(subject)
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
      subjectComponents[i] = isoComponentsToLocal[stream.readU32()]
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
      subjectEncoder.decodeEntityPresence(stream)
    }
  },
})

export interface PresenceState extends Sendable {
  readonly subjectPrioritizer: SubjectPrioritizer
  readonly subjectType: j.Type
  readonly subjectQueue: PriorityQueueInt<j.Entity>
  step(
    world: j.World,
    entity: j.Entity,
    subjects: Set<j.Entity>,
    stream: WriteStream,
  ): void
}

export class PresenceStateImpl implements PresenceState {
  #new

  readonly subjectPrioritizer
  readonly subjectQueue
  readonly subjectType

  lastSendTime
  sendRate

  constructor(
    subjectType: j.Type,
    subjectPrioritizer: SubjectPrioritizer,
    sendRate: number,
  ) {
    this.#new = true
    this.subjectQueue = new PriorityQueueInt<j.Entity>()
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectType = subjectType
    this.lastSendTime = 0
    this.sendRate = sendRate
  }

  step(world: j.World, entity: j.Entity, subjects: Set<j.Entity>) {
    if (this.#new) {
      world.of(this.subjectType).each(subject => {
        let subjectPriority = this.subjectPrioritizer(entity, subject, world)
        this.subjectQueue.push(subject, subjectPriority)
        subjects.add(subject)
      })
      this.#new = false
    } else {
      world
        .monitor(this.subjectType)
        .eachIncluded(subject => {
          let subjectPriority = this.subjectPrioritizer(entity, subject, world)
          this.subjectQueue.push(subject, subjectPriority)
          subjects.add(subject)
        })
        .eachExcluded(subject => {
          subjects.delete(subject)
          this.subjectQueue.remove(subject)
        })
    }
    subjects.forEach(subject => {
      let subjectPriority = this.subjectPrioritizer(entity, subject, world)
      if (subjectPriority <= 0) {
        this.subjectQueue.remove(subject)
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
