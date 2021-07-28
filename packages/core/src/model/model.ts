export const $kind = Symbol("javelin_field_kind")
export const $flat = Symbol("javelin_model_flat")
export type StringMap<$Type> = { [key: string]: $Type }
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
export type FieldData<$Type> = Field & {
  get(t?: $Type): $Type
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
export type FieldArray<$Type, $Props = unknown> = FieldData<$Type[]> & {
  [$kind]: FieldKind.Array
  element: Schema | FieldOf<$Type, $Props>
}
export type FieldObject<$Type, $Props = unknown> = FieldData<
  StringMap<$Type>
> & {
  [$kind]: FieldKind.Object
  key: FieldOf<string>
  element: Schema | FieldOf<$Type, $Props>
}
export type FieldSet<$Type, $Props = unknown> = FieldData<Set<$Type>> & {
  [$kind]: FieldKind.Set
  element: Schema | FieldOf<$Type, $Props>
}
export type FieldMap<K, V, $Props = unknown> = FieldData<Map<K, V>> & {
  [$kind]: FieldKind.Map
  key: FieldOf<K>
  element: Schema | FieldOf<V, $Props>
}
export type FieldDynamic<$Type> = FieldData<$Type> & {
  [$kind]: FieldKind.Dynamic
}
export type FieldOf<$Type, $Props = unknown> = $Type extends number
  ? FieldNumber & $Props
  : $Type extends string
  ? FieldString & $Props
  : $Type extends boolean
  ? FieldBoolean & $Props
  : $Type extends (infer _)[]
  ? FieldArray<_, $Props>
  : $Type extends StringMap<infer _>
  ? FieldObject<_, $Props>
  : $Type extends Set<infer _>
  ? FieldSet<_, $Props>
  : $Type extends Map<infer K, infer V>
  ? FieldMap<K, V, $Props>
  : FieldData<$Type>
export type FieldGet<$Field extends Field> = $Field extends FieldNumber
  ? number
  : $Field extends FieldString
  ? string
  : $Field extends FieldBoolean
  ? boolean
  : $Field extends FieldArray<infer _>
  ? _[]
  : $Field extends FieldObject<infer _>
  ? StringMap<_>
  : $Field extends FieldSet<infer _>
  ? Set<_>
  : $Field extends FieldMap<infer K, infer V>
  ? Map<K, V>
  : $Field extends FieldDynamic<infer _>
  ? _
  : unknown
export type FieldExtract<$Type> = $Type extends Field
  ? FieldGet<$Type>
  : $Type extends Schema
  ? { [K in keyof $Type]: FieldExtract<$Type[K]> }
  : never

export type FieldPrimitive<$Props = unknown> = $Props &
  (FieldNumber | FieldString | FieldBoolean | FieldDynamic<unknown>)

export type FieldComplex<$Props = unknown> =
  | FieldArray<unknown, $Props>
  | FieldObject<unknown, $Props>
  | FieldSet<unknown, $Props>
  | FieldMap<unknown, unknown, $Props>

export type FieldAny = FieldPrimitive | FieldComplex

export type CollatedNodeBase = {
  id: number
  hi: number
  lo: number
  deep: boolean
  traverse: (FieldString | FieldNumber)[]
}
export type CollatedNodeSchema<$Props = unknown> = CollatedNodeBase & {
  keys: string[]
  keysByFieldId: string[]
  fields: CollatedNode<$Props>[]
  fieldsByKey: { [key: string]: CollatedNode<$Props> }
  fieldIdsByKey: { [key: string]: number }
}
export type CollatedNodeField<$Props> = (
  | FieldComplex<$Props>
  | FieldPrimitive<$Props>
) &
  CollatedNodeBase
export type CollatedNodeFieldComplex<$Props = unknown> = FieldComplex<$Props> &
  CollatedNodeBase
export type CollatedNode<$Props = unknown> =
  | CollatedNodeSchema<$Props>
  | CollatedNodeField<$Props>
export type ModelFlat<$Props = unknown> = {
  [key: number]: { [f: number]: CollatedNode<$Props> }
}
export type Model<$Props = unknown> = {
  [$flat]: ModelFlat<$Props>
  [key: number]: CollatedNode<$Props>
}
