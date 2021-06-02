import { Model } from "@javelin/core"
import { Component, Entity, UNSAFE_internals } from "@javelin/ecs"
import * as Message from "./message"
import * as MessageOp from "./message_op"

export type MessageProducer = {
  model(): void
  attach(entity: Entity, components: Component[]): void
  update(entity: Entity, components: Component[]): void
  patch(entity: Entity, component: Component, amplify?: number): void
  destroy(entity: Entity): void
  detach(entity: Entity, components: Component[]): void
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
  const queue: Message.Message[] = [Message.createMessage()]
  const _insert = (op: MessageOp.MessageOp, kind: Message.MessagePartKind) => {
    let message = queue[0]
    if (
      message === undefined ||
      op.byteLength + message.byteLength > maxByteLength
    ) {
      message = Message.createMessage()
      queue.unshift(message)
    }
    Message.insert(message, kind, op)
    return message
  }
  const model = () =>
    _insert(
      MessageOp.model(Message.getEnhancedModel()),
      Message.MessagePartKind.Model,
    )
  const snapshot = (entity: Entity, components: Component[]) =>
    _insert(
      MessageOp.snapshot(Message.getEnhancedModel(), entity, components),
      Message.MessagePartKind.Snapshot,
    )
  const patch = (entity: Entity, component: Component, amplify = Infinity) =>
    _insert(
      MessageOp.patch(Message.getEnhancedModel(), entity, component),
      Message.MessagePartKind.Patch,
    )
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
    const message = queue.pop() || Message.createMessage()
    if (message && includeModel) {
      Message.model(message)
      previousModel = UNSAFE_internals.model
    }
    return message
  }

  return {
    model,
    destroy,
    attach: snapshot,
    update: snapshot,
    detach,
    patch,
    take,
  }
}
