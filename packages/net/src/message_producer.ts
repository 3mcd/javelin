import { Model } from "@javelin/core"
import {
  Component,
  createPatch,
  Entity,
  Patch,
  resetPatch,
  UNSAFE_internals,
} from "@javelin/ecs"
import * as Message from "./message"
import * as MessageOp from "./message_op"

export type MessageProducer = {
  model(): void
  attach(entity: Entity, components: Component[]): void
  update(entity: Entity, components: Component[], amplify?: number): void
  patch(entity: Entity, component: Component, amplify?: number): void
  detach(entity: Entity, components: Component[]): void
  destroy(entity: Entity): void
  take(includeModel?: boolean): Message.Message | null
}
export type MessageProducerOptions = {
  maxByteLength?: number
}

type EntityMap<T> = T[]

export function createMessageProducer(
  options: MessageProducerOptions = {},
): MessageProducer {
  const { maxByteLength = Infinity } = options
  let previousModel: Model | null = null
  const queue: Message.Message[] = [Message.createMessage()]
  const entityPriorities: EntityMap<number> = []
  const entityUpdates: EntityMap<Map<number, Component>> = []
  const entityPatches: EntityMap<Patch> = []
  function entityPriorityComparator(a: Entity, b: Entity) {
    return (entityPriorities[b] ?? 0) - (entityPriorities[a] ?? 0)
  }
  function enqueue(op: MessageOp.MessageOp, kind: Message.MessagePartKind) {
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
  function model() {
    enqueue(
      MessageOp.model(Message.getEnhancedModel()),
      Message.MessagePartKind.Model,
    )
  }
  function snapshot(entity: Entity, components: Component[]) {
    enqueue(
      MessageOp.snapshot(Message.getEnhancedModel(), entity, components),
      Message.MessagePartKind.Snapshot,
    )
  }
  function update(entity: Entity, components: Component[], amplify = Infinity) {
    let updates = entityUpdates[entity]
    if (updates === undefined) {
      updates = entityUpdates[entity] = new Map()
    }
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      updates.set(component.__type__, component)
    }
    entityPriorities[entity] = (entityPriorities[entity] ?? 0) + amplify
  }
  function patch(entity: Entity, component: Component, amplify = Infinity) {
    entityPatches[entity] = createPatch(component, entityPatches[entity])
    entityPriorities[entity] = (entityPriorities[entity] ?? 0) + amplify
  }
  function detach(entity: Entity, components: Component[]) {
    enqueue(
      MessageOp.detach(
        entity,
        components.map(c => c.__type__),
      ),
      Message.MessagePartKind.Detach,
    )
  }
  function destroy(entity: Entity) {
    enqueue(MessageOp.destroy(entity), Message.MessagePartKind.Destroy)
  }
  function take(includeModel = previousModel !== UNSAFE_internals.model) {
    const message = queue.pop() || Message.createMessage()
    if (includeModel) {
      Message.model(message)
      previousModel = UNSAFE_internals.model
    }
    const entities = Array.from(entityPriorities.keys())
    const prioritized = entities.sort(entityPriorityComparator)
    for (let i = 0; i < prioritized.length; i++) {
      const entity = prioritized[i]
      const patch = entityPatches[entity]
      const update = entityUpdates[entity]
      if (update !== undefined && update.size > 0) {
        const components = Array.from(update.values())
        const op = MessageOp.snapshot(
          Message.getEnhancedModel(),
          entity,
          components,
        )
        if (op.byteLength + message?.byteLength < maxByteLength) {
          Message.insert(message, Message.MessagePartKind.Snapshot, op)
          update.clear()
          entityPriorities[entity] = 0
        }
      }
      if (
        patch !== undefined &&
        (patch.changes.size > 0 || patch.children.size > 0)
      ) {
        const op = MessageOp.patch(Message.getEnhancedModel(), entity, patch)
        if (op.byteLength + message?.byteLength < maxByteLength) {
          Message.insert(message, Message.MessagePartKind.Patch, op)
          resetPatch(patch)
          entityPriorities[entity] = 0
        }
      }
    }
    return message
  }

  return {
    model,
    attach: snapshot,
    update,
    patch,
    detach,
    destroy,
    take,
  }
}
