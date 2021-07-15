import { Model } from "@javelin/core"
import {
  Component,
  createPatch,
  Entity,
  Patch,
  resetPatch,
  UNSAFE_internals,
} from "@javelin/ecs"
import { createEntityMap } from "./entity_map"
import EntityPriorityQueue from "./entity_priority_queue"
import * as Message from "./message"
import * as MessageOp from "./message_op"

export type MessageProducer = {
  /**
   * Increase the likelihood the specified entity will be included in the next
   * message by some factor.
   */
  amplify(entity: Entity, priority: number): void

  /**
   * Enqueue an attach operation.
   */
  attach(entity: Entity, components: Component[]): void

  /**
   * Enqueue an update (component data) operation.
   */
  update(entity: Entity, components: Component[], amplify?: number): void

  /**
   * Enqueue a patch operation.
   */
  patch(entity: Entity, component: Component, amplify?: number): void

  /**
   * Enqueue a detach operation.
   */
  detach(entity: Entity, components: Component[]): void

  /**
   * Enqueue a destroy operation.
   */
  destroy(entity: Entity): void

  /**
   * Dequeue a message.
   */
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
  const entityPriorities = new EntityPriorityQueue()
  const entityUpdates = createEntityMap<Map<number, Component>>()
  const entityPatches = createEntityMap<Patch>()
  function amplify(entity: Entity, priority: number) {
    const current = entityPriorities.getPriority(entity) ?? 0
    entityPriorities.changePriority(entity, current + priority)
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
  function attach(entity: Entity, components: Component[]) {
    enqueue(
      MessageOp.snapshot(Message.getEnhancedModel(), entity, components),
      Message.MessagePartKind.Attach,
    )
  }
  function update(entity: Entity, components: Component[], priority = 1) {
    let updates = entityUpdates[entity]
    if (updates === undefined) {
      updates = entityUpdates[entity] = new Map()
    }
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      updates.set(component.__type__, component)
    }
    amplify(entity, priority)
  }
  function patch(entity: Entity, component: Component, priority = 1) {
    entityPatches[entity] = createPatch(component, entityPatches[entity])
    amplify(entity, priority)
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
    entityPriorities.remove(entity)
  }
  function take(includeModel = previousModel !== UNSAFE_internals.model) {
    const message = queue.pop() || Message.createMessage()
    if (includeModel) {
      Message.model(message)
      previousModel = UNSAFE_internals.model
    }
    while (true) {
      const entity = entityPriorities.poll()
      if (entity === null || entity === undefined) {
        break
      }
      const update = entityUpdates[entity]
      const patch = entityPatches[entity]
      const model = Message.getEnhancedModel()
      if (update && update.size > 0) {
        const components = Array.from(update.values())
        const op = MessageOp.snapshot(model, entity, components)
        if (op.byteLength + message?.byteLength >= maxByteLength) {
          break
        }
        Message.insert(message, Message.MessagePartKind.Snapshot, op)
        update.clear()
      }
      if (patch && (patch.changes.size > 0 || patch.children.size > 0)) {
        const op = MessageOp.patch(model, entity, patch)
        if (op.byteLength + message?.byteLength >= maxByteLength) {
          break
        }
        Message.insert(message, Message.MessagePartKind.Patch, op)
        resetPatch(patch)
      }
    }
    return message
  }

  return {
    amplify,
    attach,
    update,
    patch,
    detach,
    destroy,
    take,
  }
}
