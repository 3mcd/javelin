import { Component, Entity } from "@javelin/ecs"
import { InstanceOfSchema } from "@javelin/model"
import { uint16, uint8 } from "@javelin/pack"
import { ChangeSet } from "@javelin/track"
import * as MessageOps from "./message_op"

export type Message = {
  parts: MessagePart[]
  byteLength: number
}

export enum MessagePartKind {
  Tick,
  Model,
  Spawn,
  Attach,
  Update,
  Patch,
  Detach,
  Destroy,
}

export type MessagePart = {
  ops: MessageOps.MessageOp[]
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
    byteLength: uint8.byteLength + uint16.byteLength, // kind + length
  }
}

export function getOrSetPart(message: Message, kind: MessagePartKind) {
  let part = message.parts[kind]
  if (part === undefined) {
    part = createMessagePart(kind)
    message.parts[kind] = part
    message.byteLength += part.byteLength
  }
  return part
}

export function insert(
  message: Message,
  kind: MessagePartKind,
  op: MessageOps.MessageOp,
) {
  const part = getOrSetPart(message, kind)
  part.ops.push(op)
  part.byteLength += op.byteLength
  message.byteLength += op.byteLength
}

export function spawn(
  message: Message,
  entity: Entity,
  components: Component[],
) {
  insert(message, MessagePartKind.Spawn, MessageOps.spawn(entity, components))
}

export function attach(
  message: Message,
  entity: Entity,
  components: Component[],
) {
  insert(message, MessagePartKind.Attach, MessageOps.attach(entity, components))
}

export function update(
  message: Message,
  entity: Entity,
  components: Component[],
) {
  insert(message, MessagePartKind.Update, MessageOps.update(entity, components))
}

export function patch(
  message: Message,
  entity: Entity,
  changeset: InstanceOfSchema<typeof ChangeSet>,
) {
  insert(message, MessagePartKind.Patch, MessageOps.patch(entity, changeset))
}

export function detach(
  message: Message,
  entity: Entity,
  componentTypeIds: number[],
) {
  insert(
    message,
    MessagePartKind.Destroy,
    MessageOps.detach(entity, componentTypeIds),
  )
}

export function destroy(message: Message, entity: Entity) {
  insert(message, MessagePartKind.Destroy, MessageOps.destroy(entity))
}
