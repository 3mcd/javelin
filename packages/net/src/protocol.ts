import {
  Component,
  serializeComponentType,
  SerializedComponentType,
  World,
  WorldOp,
} from "@javelin/ecs"

export enum JavelinMessageType {
  // Core
  Ops,
  Update,
  UpdateUnreliable,
  // Debug
  Spawn,
  Model,
}

// [entity, componentTypeA, ComponentPatch, componentTypeB, ComponentPatch, ...]
export type UpdatePayload = unknown[]

// [entity, ComponentA, ComponentB, entity, ComponentA]
export type UpdateUnreliablePayload = (number | Component)[]

export type Ops = [JavelinMessageType.Ops, WorldOp[], boolean]
export type Update = [
  JavelinMessageType.Update,
  boolean,
  unknown,
  ...UpdatePayload
]
export type UpdateUnreliable = [
  JavelinMessageType.UpdateUnreliable,
  boolean,
  unknown,
  ...UpdateUnreliablePayload
]
export type Spawn = [JavelinMessageType.Spawn, Component[]]
export type ModelOld = [JavelinMessageType.Model, SerializedComponentType[]]

export function setUpdateMetadata(
  update: UpdateUnreliable,
  metadata: unknown,
): UpdateUnreliable {
  const copy = update.slice()
  update[2] = metadata
  return copy as UpdateUnreliable
}

export function isOpsMessage(message: unknown): message is Ops {
  return Array.isArray(message) && message[0] === JavelinMessageType.Ops
}

export function isUpdateMessage(message: unknown): message is Update {
  return Array.isArray(message) && message[0] === JavelinMessageType.Update
}

export const protocol = {
  ops: (ops: WorldOp[], isLocal = false): Ops => [
    JavelinMessageType.Ops,
    ops,
    isLocal,
  ],
  update: (
    payload: UpdatePayload,
    metadata?: unknown,
    isLocal = false,
  ): Update => [JavelinMessageType.Update, isLocal, metadata, ...payload],
  updateUnreliable: (
    payload: UpdateUnreliablePayload,
    metadata?: unknown,
    isLocal = false,
  ): UpdateUnreliable => [
    JavelinMessageType.UpdateUnreliable,
    isLocal,
    metadata,
    ...payload,
  ],
  spawn: (components: Component[]): Spawn => [
    JavelinMessageType.Spawn,
    components,
  ],
  model: (world: World): ModelOld => [
    JavelinMessageType.Model,
    world.componentTypes.map(serializeComponentType),
  ],
}

export type JavelinProtocol = typeof protocol
export type JavelinMessage = {
  [K in keyof JavelinProtocol]: ReturnType<JavelinProtocol[K]>
}[keyof JavelinProtocol]
