import {
  assert,
  ErrorType,
  FieldExtract,
  initializeWithSchema,
  Model,
} from "@javelin/core"
import { Component, Entity, UNSAFE_internals } from "@javelin/ecs"
import { ChangeSet, copy, reset } from "@javelin/track"
import * as Message from "./message"
import * as MessageOp from "./message_op"

export type MessageProducer = {
  model(): void
  destroy(entity: Entity): void
  attach(entity: Entity, components: Component[]): void
  detach(entity: Entity, components: Component[]): void
  update(entity: Entity, components: Component[]): void
  patch(
    entity: Entity,
    changes: FieldExtract<typeof ChangeSet>,
    priority?: number,
  ): void
  take(includeModel?: boolean): Message.Message | null
}
export type MessageProducerOptions = {
  maxByteLength?: number
}

export function createMessageProducer(
  options: MessageProducerOptions = {},
): MessageProducer {
  const { maxByteLength = Infinity } = options
  let previousModel: Model | null = null
  const messageQueue: Message.Message[] = [Message.createMessage()]
  const entityPriorities = new Map<Entity, number>()
  const entityChangeSets = new Map<Entity, FieldExtract<typeof ChangeSet>>()
  const _insert = (op: MessageOp.MessageOp, kind: Message.MessagePartKind) => {
    let message = messageQueue[0]
    if (
      message === undefined ||
      op.byteLength + message.byteLength > maxByteLength
    ) {
      message = Message.createMessage()
      messageQueue.unshift(message)
    }
    Message.insert(message, kind, op)
    return message
  }
  const model = () =>
    _insert(
      MessageOp.model(UNSAFE_internals.model),
      Message.MessagePartKind.Model,
    )
  const attach = (entity: Entity, components: Component[]) =>
    _insert(
      MessageOp.attach(UNSAFE_internals.model, entity, components),
      Message.MessagePartKind.Attach,
    )
  const update = (entity: Entity, components: Component[]) =>
    _insert(
      MessageOp.update(UNSAFE_internals.model, entity, components),
      Message.MessagePartKind.Update,
    )
  const patch = (
    entity: Entity,
    changes: FieldExtract<typeof ChangeSet>,
    priority = Infinity,
  ) => {
    let changeset = entityChangeSets.get(entity)
    if (changeset === undefined) {
      changeset = initializeWithSchema(
        {} as FieldExtract<typeof ChangeSet>,
        ChangeSet,
      )
      entityChangeSets.set(entity, changeset)
    }
    copy(changes, changeset)
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
  const take = (includeModel = previousModel !== UNSAFE_internals.model) => {
    const message = messageQueue.pop() || Message.createMessage()
    const entities = entityPriorities.keys()
    const prioritized = Array.from(entities).sort(
      (a, b) => (entityPriorities.get(b) ?? 0) - (entityPriorities.get(a) ?? 0),
    )
    for (let i = 0; i < prioritized.length; i++) {
      const entity = prioritized[i]
      const changeset = entityChangeSets.get(entity)
      if (changeset !== undefined && changeset.touched) {
        assert(message !== null, "", ErrorType.Internal)
        const op = MessageOp.patch(UNSAFE_internals.model, entity, changeset)
        if (op.byteLength + message?.byteLength < maxByteLength) {
          Message.insert(message, Message.MessagePartKind.Patch, op)
          reset(changeset)
          entityPriorities.set(entity, 0)
        }
      }
    }
    if (message && includeModel) {
      Message.model(message)
      previousModel = UNSAFE_internals.model
    }
    return message
  }

  return { model, destroy, attach, detach, update, patch, take }
}
