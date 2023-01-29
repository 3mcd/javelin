import {Component, Entity, QuerySelector, type} from "@javelin/ecs"
import {EntityEncoder} from "./encode.js"
import {PriorityQueueInt} from "./priority_queue_int.js"
import {ProtocolMessageType} from "./protocol.js"

/**
 * Encodes and decodes entity presence messages.
 */
export let presenceMessageType: ProtocolMessageType<Presence> = {
  encode(writeStream, world, presence) {
    let {subjectSelector} = presence
    let subjectQuery = world.of(subjectSelector)
    let subjectMonitor = world.monitor(subjectSelector)
    let subjectComponents = subjectSelector.type.components
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectSelector)
    let subjectCount = presence.isNew()
      ? subjectQuery.length
      : subjectMonitor.includedLength
    subjectMonitor.eachExcluded(entity => {
      presence.subjectQueue.remove(entity)
    })
    writeStream.grow(
      presence.metaLength + subjectCount * subjectEncoder.bytesPerEntity,
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
        subjectEncoder.encode(entity, writeStream)
      })
      presence.init()
    } else {
      subjectMonitor.eachIncluded(entity => {
        subjectEncoder.encode(entity, writeStream)
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
    let subjectSelector = type.apply(null, subjectComponents)
    let subjectEncoder = EntityEncoder.getEntityEncoder(world, subjectSelector)
    // (3)
    let subjectCount = readStream.readU16()
    // (4)
    for (let i = 0; i < subjectCount; i++) {
      subjectEncoder.decode(readStream)
    }
  },
}

export class Presence {
  #new

  readonly entity
  readonly metaLength
  readonly subjectQueue
  readonly subjectSelector

  constructor(entity: Entity, subjectSelector: QuerySelector) {
    this.#new = true
    this.entity = entity
    this.metaLength = 1 + 2 + subjectSelector.type.components.length * 4
    this.subjectQueue = new PriorityQueueInt()
    this.subjectSelector = subjectSelector
  }

  isNew() {
    return this.#new
  }

  init() {
    this.#new = false
  }
}

export let makePresence = (entity: Entity, subject: QuerySelector) =>
  new Presence(entity, subject)
