import {
  Component,
  createPatch,
  Entity,
  UNSAFE_internals,
  UNSAFE_modelChanged,
} from "@javelin/ecs"
import { enhanceModel, ModelEnhanced, uint32, uint8 } from "@javelin/pack"
import * as Ops from "./message_op"

export type Message = {
  parts: MessagePart[]
  byteLength: number
}

export enum MessagePartKind {
  Model,
  Attach,
  Snapshot,
  Patch,
  Detach,
  Destroy,
}

export type MessagePart = {
  ops: Ops.MessageOp[]
  kind: MessagePartKind
  byteLength: number
}

let enhancedModel: ModelEnhanced = enhanceModel(UNSAFE_internals.model)

UNSAFE_modelChanged.subscribe(model => (enhancedModel = enhanceModel(model)))

export function getEnhancedModel() {
  return enhancedModel
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
  message.byteLength -= part.byteLength
  clearMessagePart(part)
  insert(message, kind, op)
}

export function model(message: Message) {
  overwrite(message, MessagePartKind.Model, Ops.model(enhancedModel))
}

export function attach(
  message: Message,
  entity: Entity,
  components: Component[],
) {
  insert(
    message,
    MessagePartKind.Attach,
    Ops.snapshot(enhancedModel, entity, components),
  )
}

export function snapshot(
  message: Message,
  entity: Entity,
  components: Component[],
) {
  insert(
    message,
    MessagePartKind.Snapshot,
    Ops.snapshot(enhancedModel, entity, components),
  )
}

export function patch(message: Message, entity: Entity, component: Component) {
  insert(
    message,
    MessagePartKind.Patch,
    Ops.patch(enhancedModel, entity, createPatch(component)),
  )
}

export function detach(message: Message, entity: Entity, schemaIds: number[]) {
  insert(message, MessagePartKind.Destroy, Ops.detach(entity, schemaIds))
}

export function destroy(message: Message, entity: Entity) {
  insert(message, MessagePartKind.Destroy, Ops.destroy(entity))
}
