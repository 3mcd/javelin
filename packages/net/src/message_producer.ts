import { Model } from "@javelin/core"
import {
  Component,
  createPatch,
  Entity,
  getSchemaId,
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
  const queue: Message.Message[] = [Message.createMessage()]
  const entityPriorities = new EntityPriorityQueue()
  const entityUpdates = createEntityMap<Map<number, Component>>()
  const entityPatches = createEntityMap<Patch>()

  let previousModel: Model | null = null

  function amplify(entity: Entity, priority: number) {
    entityPriorities.changePriority(
      entity,
      (entityPriorities.getPriority(entity) ?? 0) + priority,
    )
  }

  function enqueue(op: MessageOp.MessageOp, kind: Message.MessagePartKind) {
    let message = queue[0]
    // calculate the new message length. if we exceed the maxByteLength threshold,
    // create an enqueue a new message
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
    // overwrite existing component updates with latest component, in case it
    // changed (i.e. the original component was detached and a new instance
    // was attached)
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      updates.set(getSchemaId(component), component)
    }
    amplify(entity, priority)
  }

  function patch(entity: Entity, component: Component, priority = 1) {
    // merge entity changes into existing patch (if any)
    entityPatches[entity] = createPatch(component, entityPatches[entity])
    amplify(entity, priority)
  }

  function detach(entity: Entity, components: Component[]) {
    enqueue(
      MessageOp.detach(entity, components.map(getSchemaId)),
      Message.MessagePartKind.Detach,
    )
  }

  function destroy(entity: Entity) {
    enqueue(MessageOp.destroy(entity), Message.MessagePartKind.Destroy)
    // remove any planned patches or updates since the entity was destroyed
    delete entityPatches[entity]
    delete entityUpdates[entity]
    entityPriorities.remove(entity)
  }

  function take(includeModel = previousModel !== UNSAFE_internals.model) {
    const message = queue.pop() || Message.createMessage()
    // insert a new model automatically if it has changed. otherwise, the
    // caller can pass `true` to force model inclusion
    if (includeModel) {
      Message.model(message)
      previousModel = UNSAFE_internals.model
    }
    const model = Message.getEnhancedModel()
    while (true) {
      // take the next-highest priority entity out of the priority queue
      const entity = entityPriorities.poll()
      if (entity === null || entity === undefined) {
        break
      }
      const update = entityUpdates[entity]
      const patch = entityPatches[entity]
      // include component updates
      if (update && update.size > 0) {
        const components = Array.from(update.values())
        const op = MessageOp.snapshot(model, entity, components)
        // message would exceed max byte length
        if (op.byteLength + message?.byteLength >= maxByteLength) {
          break
        }
        Message.insert(message, Message.MessagePartKind.Snapshot, op)
        update.clear()
      }
      // include component patches
      if (patch && (patch.changes.size > 0 || patch.children.size > 0)) {
        const op = MessageOp.patch(model, entity, patch)
        // message would exceed max byte length
        if (op.byteLength + message?.byteLength >= maxByteLength) {
          break
        }
        Message.insert(message, Message.MessagePartKind.Patch, op)
        // reset the patch since it was incorporated into a message
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
