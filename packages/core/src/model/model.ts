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
export type FieldArray<T, P = unknown> = FieldData<T[]> & {
  [$kind]: FieldKind.Array
  element: Schema | FieldOf<T, P>
}
export type FieldObject<T, P = unknown> = FieldData<StringMap<T>> & {
  [$kind]: FieldKind.Object
  key: FieldOf<string>
  element: Schema | FieldOf<T, P>
}
export type FieldSet<T, P = unknown> = FieldData<Set<T>> & {
  [$kind]: FieldKind.Set
  element: Schema | FieldOf<T, P>
}
export type FieldMap<K, V, P = unknown> = FieldData<Map<K, V>> & {
  [$kind]: FieldKind.Map
  key: FieldOf<K>
  element: Schema | FieldOf<V, P>
}
export type FieldDynamic<T> = FieldData<T> & {
  [$kind]: FieldKind.Dynamic
}
export type FieldOf<T, P = unknown> = T extends number
  ? FieldNumber & P
  : T extends string
  ? FieldString & P
  : T extends boolean
  ? FieldBoolean & P
  : T extends (infer _)[]
  ? FieldArray<_, P>
  : T extends StringMap<infer _>
  ? FieldObject<_, P>
  : T extends Set<infer _>
  ? FieldSet<_, P>
  : T extends Map<infer K, infer V>
  ? FieldMap<K, V, P>
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
  : T extends FieldDynamic<infer _>
  ? _
  : unknown
export type FieldExtract<T> = T extends Field
  ? FieldGet<T>
  : T extends Schema
  ? { [K in keyof T]: FieldExtract<T[K]> }
  : never

export type FieldPrimitive<P = unknown> = P &
  (FieldNumber | FieldString | FieldBoolean | FieldDynamic<unknown>)

export type FieldComplex<P = unknown> =
  | FieldArray<unknown, P>
  | FieldObject<unknown, P>
  | FieldSet<unknown, P>
  | FieldMap<unknown, unknown, P>

export type FieldAny = FieldPrimitive | FieldComplex

export type CollatedNodeBase = {
  id: number
  hi: number
  lo: number
  deep: boolean
  traverse: (FieldString | FieldNumber)[]
}
export type CollatedNodeSchema<P = unknown> = CollatedNodeBase & {
  keys: string[]
  keysByFieldId: string[]
  fields: CollatedNode<P>[]
  fieldsByKey: { [key: string]: CollatedNode<P> }
  fieldIdsByKey: { [key: string]: number }
}
export type CollatedNodeField<P> = (FieldComplex<P> | FieldPrimitive<P>) &
  CollatedNodeBase
export type CollatedNodeFieldComplex<P = unknown> = FieldComplex<P> &
  CollatedNodeBase
export type CollatedNode<P = unknown> =
  | CollatedNodeSchema<P>
  | CollatedNodeField<P>
export type ModelFlat<P = unknown> = {
  [key: number]: { [f: number]: CollatedNode<P> }
}
export type Model<P = unknown> = {
  [$flat]: ModelFlat<P>
  [key: number]: CollatedNode<P>
}
