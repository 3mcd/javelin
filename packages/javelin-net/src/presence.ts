import {Component, Entity, Type, type, World} from "@javelin/ecs"
import {EntityEncoder} from "./encode.js"
import {Interest, SubjectPrioritizer} from "./interest.js"
import {ProtocolMessageType} from "./protocol.js"

/**
 * Encodes and decodes entity presence messages.
 */
export let presenceMessageType: ProtocolMessageType<Presence> = {
  encode(writeStream, world, presence) {
    let {subjectType} = presence
    let subjectQuery = world.of(subjectType)
    let subjectMonitor = world.monitor(subjectType)
    let subjectComponents = subjectType.normalized.components
    let subjectCount = presence.isNew()
      ? subjectQuery.length
      : subjectMonitor.includedLength
    subjectMonitor
      .eachIncluded(subject => {
        presence.subjectQueue.push(subject, 0)
      })
      .eachExcluded(subject => {
        presence.subjectQueue.remove(subject)
      })
    writeStream.grow(
      1 + 2 + subjectType.normalized.components.length * 4 + subjectCount * 4,
    )
    // (1)
    writeStream.writeU8(subjectComponents.length)
    // (2)
    for (let i = 0; i < subjectComponents.length; i++) {
      writeStream.writeU32(subjectComponents[i])
    }
    // (3)
    writeStream.writeU16(subjectCount)
    // (4)
    if (presence.isNew()) {
      subjectQuery.each(entity => {
        writeStream.writeU32(entity)
      })
      presence.init()
    } else {
      subjectMonitor.eachIncluded(entity => {
        writeStream.writeU32(entity)
      })
    }
  },
  decode(readStream, world) {
    // (1)
    let subjectComponentsLength = readStream.readU8()
    // (2)
    let subjectComponents: Component[] = []
    for (let i = 0; i < subjectComponentsLength; i++) {
      subjectComponents.push(readStream.readU32() as Component)
    }
    let subjectType = type.apply(null, subjectComponents)
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectType)
    // (3)
    let subjectCount = readStream.readU16()
    // (4)
    for (let i = 0; i < subjectCount; i++) {
      subjectEncoder.decodeEntityCompose(readStream)
    }
  },
}

export class Presence extends Interest {
  #new

  constructor(
    entity: Entity,
    subjectType: Type,
    subjectPrioritizer: SubjectPrioritizer,
  ) {
    super(entity, subjectType, subjectPrioritizer)
    this.#new = true
  }

  isNew() {
    return this.#new
  }

  init() {
    this.#new = false
  }

  prioritize(world: World) {
    world
      .monitor(this.subjectType)
      .eachIncluded(subject => {
        this.subjectQueue.push(subject, 0)
      })
      .eachExcluded(subject => {
        this.subjectQueue.remove(subject)
      })
    super.prioritize(world)
  }
}

export let makePresence = (
  entity: Entity,
  subjectType: Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
) => new Presence(entity, subjectType, subjectPrioritizer)
