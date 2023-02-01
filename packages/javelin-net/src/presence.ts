import * as j from "@javelin/ecs"
import {MTU_SIZE} from "./const.js"
import {EntityEncoder} from "./encode.js"
import {SubjectPrioritizer} from "./interest.js"
import {NormalizedNetworkModel} from "./network_model.js"
import {ProtocolMessageType} from "./protocol.js"
import {PriorityQueueInt} from "./structs/priority_queue_int.js"

let subjectComponents: j.Component[] = []

/**
 * Encodes and decodes entity presence messages.
 */
export let presenceMessageType: ProtocolMessageType<PresenceState> = {
  encode(writeStream, world, presence) {
    let {localComponentsToIso} = world.getResource(NormalizedNetworkModel)
    let {subjectType} = presence
    let subjectComponents = subjectType.normalized.components
    let subjectQueueLength = presence.subjectQueue.length
    if (subjectQueueLength === 0) {
      return
    }
    let mtuDiff = MTU_SIZE - writeStream.offset
    if (mtuDiff <= 0) {
      return
    }
    let growAmount =
      1 +
      2 +
      subjectComponents.length * 4 +
      Math.min(mtuDiff, subjectQueueLength * 4)
    writeStream.grow(growAmount)
    // (1)
    writeStream.writeU8(subjectComponents.length)
    // (2)
    for (let i = 0; i < subjectComponents.length; i++) {
      writeStream.writeU32(localComponentsToIso[subjectComponents[i]])
    }
    // (3)
    let subjectCount = 0
    let subjectCountOffset = writeStream.writeU16(0)
    while (writeStream.offset < MTU_SIZE && !presence.subjectQueue.isEmpty()) {
      let subject = presence.subjectQueue.pop()!
      // (4)
      writeStream.writeU32(subject)
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
      subjectComponents[i] = isoComponentsToLocal[readStream.readU32()]
    }
    let subjectType = j.type.apply(null, subjectComponents)
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectType)
    // (3)
    let subjectCount = readStream.readU16()
    // (4)
    for (let i = 0; i < subjectCount; i++) {
      subjectEncoder.decodeEntityPresence(readStream)
    }
  },
}

export class PresenceState {
  #new

  readonly subjectPrioritizer
  readonly subjectQueue
  readonly subjectType

  constructor(subjectType: j.Type, subjectPrioritizer: SubjectPrioritizer) {
    this.#new = true
    this.subjectQueue = new PriorityQueueInt<j.Entity>()
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectType = subjectType
  }

  prioritize(world: j.World, entity: j.Entity, subjects: Set<j.Entity>) {
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

export class Presence {
  readonly subjectPrioritizer
  readonly subjectType

  constructor(subjectType: j.Type, subjectPrioritizer: SubjectPrioritizer) {
    this.subjectPrioritizer = subjectPrioritizer
    this.subjectType = subjectType
  }

  init() {
    return new PresenceState(this.subjectType, this.subjectPrioritizer)
  }
}

export let makePresence = (
  subjectType: j.Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
) => new Presence(subjectType, subjectPrioritizer)
