import { Component, ComponentType, Entity } from "@javelin/ecs"
import { InstanceOfSchema } from "@javelin/model"
import { ChangeSet } from "@javelin/track"
import * as Message from "./message"

export type MessageProducer = {
  spawn(entity: Entity, components: Component[]): void
  destroy(entity: Entity): void
  attach(entity: Entity, components: Component[]): void
  detach(entity: Entity, components: Component[]): void
  patch(
    entity: Entity,
    componentType: ComponentType,
    changes: InstanceOfSchema<typeof ChangeSet>,
    priority?: number,
  ): void
  take(): Message.Message | null
}
export type MessageProducerOptions = {
  maxByteLength?: number
}

export const createMessageProducer = (
  options: MessageProducerOptions = {},
): MessageProducer => {
  const { maxByteLength = Infinity } = options
  const messageQueue: Message.Message[] = []
  const changeBuffer = new Map()
  const spawn = (entity: Entity, components: Component[]) => {}
  const destroy = (entity: Entity) => {}
  const attach = (entity: Entity, components: Component[]) => {}
  const detach = (entity: Entity, components: Component[]) => {}
  const patch = (
    entity: Entity,
    componentType: ComponentType,
    changes: InstanceOfSchema<typeof ChangeSet>,
    priority = Infinity,
  ) => {
    throw new Error("Not implemented")
  }
  const take = () => messageQueue.pop() || null

  return { spawn, destroy, attach, detach, patch, take }
}
