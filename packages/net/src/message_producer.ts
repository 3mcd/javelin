import { ComponentType, Entity, ObserverChangeSet } from "@javelin/ecs"
import { Message } from "./protocol"

export type MessageProducer = {}
export type MessageProducerOptions = {
  maxByteLength?: number
}

export const createMessageProducer = (
  options: MessageProducerOptions = {},
): MessageProducer => {
  const changeBuffer = new Map()
  const insert = (message: Message) => {}

  const spawn = () => {}
  const destroy = () => {}
  const attach = () => {}
  const detach = () => {}
  const patch = (
    entity: Entity,
    componentType: ComponentType,
    changes: ObserverChangeSet,
    priority = Infinity,
  ) => {}
  const take = () => {}

  return { spawn, destroy, attach, detach, patch, take }
}
