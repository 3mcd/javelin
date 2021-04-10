import {
  DataType,
  DataTypeArray,
  DataTypePrimitive,
  InstanceOfSchema,
  Model,
  Schema,
  SchemaKey,
} from "./index"

type PatchArray<T> = {
  insert?: [index: number, value: T]
  splice?: [index: number, remove: number, value: T]
  [key: number]: T
}

type PatchField<T extends DataType> = T extends DataTypePrimitive
  ? T["defaultValue"]
  : T extends DataTypeArray<infer _>
  ? PatchArray<
      _ extends Schema ? Patch<_> : _ extends DataType ? PatchField<_> : never
    >
  : never

type PatchKey<K extends SchemaKey> = K extends Schema
  ? Patch<K>
  : K extends DataType
  ? PatchField<K>
  : never

export type Patch<S extends Schema> = {
  [K in keyof S]?: PatchKey<S[K]>
}

export const patch = <S extends Schema>(
  model: Model,
  instance: InstanceOfSchema<S>,
  patch: Patch<S>,
) => {}
