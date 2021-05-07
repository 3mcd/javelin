import { Component, Entity, UNSAFE_internals } from "@javelin/ecs"
import { ErrorType, initialize, InstanceOfSchema } from "@javelin/core"
import { ChangeSet, copy, reset } from "@javelin/track"
import { assert } from "console"
import * as Message from "./message"
import * as MessageOp from "./message_op"

export type MessageProducer = {
  spawn(entity: Entity, components: Component[]): void
  destroy(entity: Entity): void
  attach(entity: Entity, components: Component[]): void
  detach(entity: Entity, components: Component[]): void
  patch(
    entity: Entity,
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
  const messageQueue: Message.Message[] = [Message.createMessage()]
  const entityPriorities = new Map<Entity, number>()
  const entityChangeSets = new Map<Entity, InstanceOfSchema<typeof ChangeSet>>()
  const _insert = (op: MessageOp.MessageOp, kind: Message.MessagePartKind) => {
    let message = messageQueue[0]
    if (op.byteLength + message.byteLength > maxByteLength) {
      message = Message.createMessage()
      messageQueue.unshift(message)
    }
    Message.insert(message, kind, op)
    return message
  }
  const spawn = (entity: Entity, components: Component[]) =>
    _insert(
      MessageOp.spawn(UNSAFE_internals.model, entity, components),
      Message.MessagePartKind.Spawn,
    )
  const attach = (entity: Entity, components: Component[]) =>
    _insert(
      MessageOp.attach(UNSAFE_internals.model, entity, components),
      Message.MessagePartKind.Attach,
    )
  const patch = (
    entity: Entity,
    nextChangeSet: InstanceOfSchema<typeof ChangeSet>,
    priority = Infinity,
  ) => {
    let changeSet = entityChangeSets.get(entity)
    if (changeSet === undefined) {
      changeSet = initialize(
        {} as InstanceOfSchema<typeof ChangeSet>,
        ChangeSet,
      )
      entityChangeSets.set(entity, changeSet)
    }
    copy(nextChangeSet, changeSet)
    entityPriorities.set(entity, (entityPriorities.get(entity) ?? 0) + priority)
  }
  const detach = (entity: Entity, components: Component[]) =>
    _insert(
      MessageOp.detach(
        entity,
        components.map(c => c.__type__),
      ),
      Message.MessagePartKind.Detach,
    )
  const destroy = (entity: Entity) =>
    _insert(MessageOp.destroy(entity), Message.MessagePartKind.Destroy)
  const take = () => {
    let message = messageQueue.pop() || null
    const entities = entityPriorities.keys()
    const prioritized = Array.from(entities).sort(
      (a, b) => (entityPriorities.get(a) ?? 0) - (entityPriorities.get(b) ?? 0),
    )
    for (let i = 0; i < prioritized.length; i++) {
      const entity = prioritized[i]
      const changeSet = entityChangeSets.get(entity)
      if (changeSet !== undefined && changeSet.length > 0) {
        if (message === null) {
          message = Message.createMessage()
        }
        assert(message !== null, ErrorType.Internal)
        const op = MessageOp.patch(UNSAFE_internals.model, entity, changeSet)
        if (op.byteLength + message?.byteLength < maxByteLength) {
          Message.insert(message, Message.MessagePartKind.Patch, op)
          reset(changeSet)
          entityPriorities.set(entity, 0)
        }
      }
    }
    return message
  }

  return { spawn, destroy, attach, detach, patch, take }
}
