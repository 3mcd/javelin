import {
  Component,
  ComponentType,
  Entity,
  ObserverChangeSet,
} from "@javelin/ecs"
import * as protocol from "./protocol"

export type MessageProducer = {
  spawn(entity: Entity, components: Component[]): void
  destroy(entity: Entity): void
  attach(entity: Entity, components: Component[]): void
  detach(entity: Entity, components: Component[]): void
  patch(
    entity: Entity,
    componentType: ComponentType,
    changes: ObserverChangeSet,
    priority?: number,
  ): void
  take(): protocol.Message | null
}
export type MessageProducerOptions = {
  maxByteLength?: number
}

export const createMessageProducer = (
  options: MessageProducerOptions = {},
): MessageProducer => {
  const { maxByteLength = Infinity } = options
  const messageQueue: protocol.Message[] = []
  const changeBuffer = new Map()

  const temp = protocol.createMessage()
  const maintain = () => {
    let curr = messageQueue[0]
    if (
      curr === undefined ||
      temp.partsByteLength + curr.totalByteLength > maxByteLength
    ) {
      curr = protocol.createMessage()
      messageQueue.unshift(curr)
    }
    protocol.copy(temp, curr)
    protocol.reset(temp)
  }
  const spawn = (entity: Entity, components: Component[]) => {
    protocol.spawn(temp, entity, components)
    maintain()
  }
  const destroy = (entity: Entity) => {
    protocol.destroy(temp, entity)
    maintain()
  }
  const attach = (entity: Entity, components: Component[]) => {
    protocol.attach(temp, entity, components)
    maintain()
  }
  const detach = (entity: Entity, components: Component[]) => {
    protocol.detach(temp, entity, components)
    maintain()
  }
  const patch = (
    entity: Entity,
    componentType: ComponentType,
    changes: ObserverChangeSet,
    priority = Infinity,
  ) => {
    throw new Error("Not implemented")
  }
  const take = () => messageQueue.pop() || null

  return { spawn, destroy, attach, detach, patch, take }
}
