import {
  Component,
  ComponentFactoryLike,
  ComponentSpec,
  DataType,
  isDataType,
  Schema,
  SchemaKey,
  World,
  WorldOp,
  WorldOpType,
  isComponentOf,
  ComponentType,
  ComponentOf,
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

export type SerializedComponentType<
  C extends ComponentFactoryLike = ComponentFactoryLike
> = {
  name: C["name"]
  type: C["type"]
  schema: SerializedSchema<C["schema"]>
}

export type Ops = [JavelinMessageType.Ops, WorldOp[], boolean]
export type Update = [JavelinMessageType.Update, Component[], boolean, unknown]
export type UpdateUnreliable = [
  JavelinMessageType.UpdateUnreliable,
  Component[],
  boolean,
  unknown,
]
export type Spawn = [JavelinMessageType.Spawn, ComponentSpec[]]
export type Model = [JavelinMessageType.Model, SerializedComponentType[]]

export type SerializedSchema<S extends Schema = {}> = S extends DataType<
  infer T
>
  ? T
  : {
      [K in keyof S]: S[K] extends Schema
        ? SerializedSchema<S>
        : S[K] extends DataType<any>
        ? S[K]["name"]
        : never
    }

export function serializeSchema<S extends Schema>(
  schema: S,
): SerializedSchema<S> {
  const out: any = {}

  for (const prop in schema) {
    const value = schema[prop] as SchemaKey

    if (isDataType(value)) {
      out[prop] = value.name
    } else if ("type" in value && isDataType(value.type)) {
      out[prop] = value.type.name
    } else {
      out[prop] = serializeSchema(value as Schema)
    }
  }

  return out as SerializedSchema<S>
}

export function serializeWorldModel(world: World): SerializedComponentType[] {
  return world.registeredComponentFactories.map(t => ({
    name: t.name,
    type: t.type,
    schema: serializeSchema(t.schema),
  }))
}

export function setUpdateMetadata(
  update: UpdateUnreliable,
  metadata: unknown,
): UpdateUnreliable {
  const copy = update.slice()
  update[3] = metadata
  return copy as UpdateUnreliable
}

export function isOpsMessage(message: unknown): message is Ops {
  return Array.isArray(message) && message[0] === JavelinMessageType.Ops
}

export function isUpdateMessage(message: unknown): message is Update {
  return Array.isArray(message) && message[0] === JavelinMessageType.Update
}

export function getComponentsByTypeFromUpdate<T extends ComponentType>(
  message: Update,
  componentType: T,
  callback: (component: ComponentOf<T>) => unknown,
) {
  const components = message[1]

  for (let i = 0; i < components.length; i++) {
    const component = components[i]

    if (isComponentOf(component, componentType)) {
      callback(component)
      break
    }
  }
}

export const protocol = {
  ops: (ops: WorldOp[], isLocal = false): Ops => [
    JavelinMessageType.Ops,
    ops,
    isLocal,
  ],
  update: (
    components: Component[],
    metadata?: unknown,
    isLocal = false,
  ): Update => [JavelinMessageType.Update, components, isLocal, metadata],
  updateUnreliable: (
    components: Component[],
    metadata?: unknown,
    isLocal = false,
  ): UpdateUnreliable => [
    JavelinMessageType.UpdateUnreliable,
    components,
    isLocal,
    metadata,
  ],
  spawn: (components: ComponentSpec[]): Spawn => [
    JavelinMessageType.Spawn,
    components,
  ],
  model: (world: World): Model => [
    JavelinMessageType.Model,
    serializeWorldModel(world),
  ],
}

export type JavelinProtocol = typeof protocol
export type JavelinMessage = {
  [K in keyof JavelinProtocol]: ReturnType<JavelinProtocol[K]>
}[keyof JavelinProtocol]
