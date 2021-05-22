export const $kind = Symbol("javelin_field_kind")
export const $flat = Symbol("javelin_model_flat")
export type StringMap<T> = { [key: string]: T }
export enum FieldKind {
  Number,
  String,
  Boolean,
  Array,
  Object,
  Set,
  Map,
  Dynamic,
}
export type Field = {
  [$kind]: FieldKind
}
export type Schema = { [key: string]: Field | Schema }
export type FieldData<T> = Field & {
  get(t?: T): T
}
export type FieldNumber = FieldData<number> & {
  [$kind]: FieldKind.Number
}
export type FieldString = FieldData<string> & {
  [$kind]: FieldKind.String
}
export type FieldBoolean = FieldData<boolean> & {
  [$kind]: FieldKind.Boolean
}
export type FieldArray<T> = FieldData<T[]> & {
  [$kind]: FieldKind.Array
  element: Schema | FOf<T>
}
export type FieldObject<T> = FieldData<StringMap<T>> & {
  [$kind]: FieldKind.Object
  key: FOf<string>
  element: Schema | FOf<T>
}
export type FieldSet<T> = FieldData<Set<T>> & {
  [$kind]: FieldKind.Set
  element: Schema | FOf<T>
}
export type FieldMap<K, V> = FieldData<Map<K, V>> & {
  [$kind]: FieldKind.Map
  key: FOf<K>
  element: Schema | FOf<V>
}
export type FieldDynamic<T> = FieldData<T> & {
  [$kind]: FieldKind.Dynamic
}
export type FOf<T> = T extends number
  ? FieldNumber
  : T extends string
  ? FieldString
  : T extends boolean
  ? FieldBoolean
  : T extends (infer _)[]
  ? FieldArray<_>
  : T extends StringMap<infer _>
  ? FieldObject<_>
  : T extends Set<infer _>
  ? FieldSet<_>
  : T extends Map<infer K, infer V>
  ? FieldMap<K, V>
  : FieldData<T>
export type FieldGet<T extends Field> = T extends FieldNumber
  ? number
  : T extends FieldString
  ? string
  : T extends FieldBoolean
  ? boolean
  : T extends FieldArray<infer _>
  ? _[]
  : T extends FieldObject<infer _>
  ? StringMap<_>
  : T extends FieldSet<infer _>
  ? Set<_>
  : T extends FieldMap<infer K, infer V>
  ? Map<K, V>
  : unknown
export type FieldExtract<T> = T extends Field
  ? FieldGet<T>
  : T extends Schema
  ? { [K in keyof T]: FieldExtract<T[K]> }
  : never

export type FieldPrimitive =
  | FieldNumber
  | FieldString
  | FieldBoolean
  | FieldDynamic<unknown>

export type FieldAny =
  | FieldNumber
  | FieldString
  | FieldBoolean
  | FieldArray<any>
  | FieldObject<any>
  | FieldSet<any>
  | FieldMap<any, any>
  | FieldDynamic<any>

export type CollatedNodeBase = {
  id: number
  hi: number
  lo: number
  deep: boolean
}
export type CollatedNodeSchema = CollatedNodeBase & {
  keys: string[]
  fields: CollatedNode[]
  fieldsByKey: { [key: string]: CollatedNode }
  fieldIdsByKey: { [key: string]: number }
}
export type CollatedNodeField = FieldAny & CollatedNodeBase
export type CollatedNode = CollatedNodeSchema | CollatedNodeField
export type ModelFlat = { [key: number]: { [f: number]: CollatedNode } }
export type Model = {
  [$flat]: ModelFlat
  [key: number]: CollatedNode
}
