import { ComponentType, Entity } from "@javelin/ecs"
import { ChangeSet } from "@javelin/model"
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
  const patch = (
    entity: Entity,
    componentType: ComponentType,
    changes: ChangeSet,
    priority = Infinity,
  ) => {}

  return {}
}
