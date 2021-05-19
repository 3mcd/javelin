import { InstanceOfSchema } from "@javelin/core"
import { Component, Entity, UNSAFE_internals } from "@javelin/ecs"
import { uint32, uint8 } from "@javelin/pack"
import { ChangeSet } from "@javelin/track"
import * as Ops from "./message_op"

export type Message = {
  parts: MessagePart[]
  byteLength: number
}

export enum MessagePartKind {
  Model,
  Tick,
  Attach,
  Update,
  Patch,
  Detach,
  Destroy,
}

export type MessagePart = {
  ops: Ops.MessageOp[]
  kind: MessagePartKind
  byteLength: number
}

export function createMessage(): Message {
  return {
    parts: [],
    byteLength: 0,
  }
}

export function createMessagePart(kind: MessagePartKind): MessagePart {
  return {
    ops: [],
    kind,
    byteLength: 0,
  }
}

export function clearMessagePart(part: MessagePart) {
  let op: Ops.MessageOp | undefined
  while ((op = part.ops.pop())) {
    Ops.messageOpPool.release(op)
  }
  part.byteLength = 0
}

export function getOrSetPart(message: Message, kind: MessagePartKind) {
  let part = message.parts[kind]
  if (part === undefined) {
    part = createMessagePart(kind)
    message.parts[kind] = part
    message.byteLength += uint8.byteLength + uint32.byteLength // kind + length
  }
  return part
}

export function insert(
  message: Message,
  kind: MessagePartKind,
  op: Ops.MessageOp,
) {
  if (op.byteLength === 0) {
    return
  }
  const part = getOrSetPart(message, kind)
  part.ops.push(op)
  part.byteLength += op.byteLength
  message.byteLength += op.byteLength
}

export function overwrite(
  message: Message,
  kind: MessagePartKind,
  op: Ops.MessageOp,
) {
  const part = getOrSetPart(message, kind)
  clearMessagePart(part)
  insert(message, kind, op)
}

export function tick(message: Message, tick: number) {
  overwrite(message, MessagePartKind.Tick, Ops.tick(tick))
}

export function model(message: Message) {
  overwrite(message, MessagePartKind.Model, Ops.model(UNSAFE_internals.model))
}

export function attach(
  message: Message,
  entity: Entity,
  components: Component[],
) {
  insert(
    message,
    MessagePartKind.Attach,
    Ops.attach(UNSAFE_internals.model, entity, components),
  )
}

export function update(
  message: Message,
  entity: Entity,
  components: Component[],
) {
  insert(
    message,
    MessagePartKind.Update,
    Ops.update(UNSAFE_internals.model, entity, components),
  )
}

export function patch(
  message: Message,
  entity: Entity,
  changeset: InstanceOfSchema<typeof ChangeSet>,
) {
  insert(
    message,
    MessagePartKind.Patch,
    Ops.patch(UNSAFE_internals.model, entity, changeset),
  )
}

export function detach(message: Message, entity: Entity, schemaIds: number[]) {
  insert(message, MessagePartKind.Destroy, Ops.detach(entity, schemaIds))
}

export function destroy(message: Message, entity: Entity) {
  insert(message, MessagePartKind.Destroy, Ops.destroy(entity))
}
