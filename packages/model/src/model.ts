export enum SchemaKeyKind {
  Array,
  Map,
  Primitive,
}

export enum DataTypeId {
  Number = "number",
  Boolean = "boolean",
  String = "string",
}

export type DataType<D = any> = {
  __kind__: SchemaKeyKind.Primitive
  __type__: string
  create(): D
  reset(object: any, key: string, value: D): void
}
export type ArrayType<E extends SchemaKey = SchemaKey> = {
  __kind__: SchemaKeyKind.Array
  __type__: E
}
export type MapType<E extends SchemaKey = SchemaKey> = {
  __kind__: SchemaKeyKind.Map
  __type__: E
}
export type DataTypeNumber = DataType<number>
export type DataTypeString = DataType<string>
export type DataTypeBoolean = DataType<boolean>
export type DataTypePrimitive =
  | DataTypeNumber
  | DataTypeString
  | DataTypeBoolean

export const number: DataTypeNumber = {
  __kind__: SchemaKeyKind.Primitive,
  __type__: DataTypeId.Number,
  create: () => 0,
  reset: (object, key) => (object[key] = 0),
}
export const string: DataTypeString = {
  __kind__: SchemaKeyKind.Primitive,
  __type__: DataTypeId.String,
  create: () => "",
  reset: (object, key) => (object[key] = 0),
}
export const boolean: DataTypeBoolean = {
  __kind__: SchemaKeyKind.Primitive,
  __type__: DataTypeId.Boolean,
  create: () => false,
  reset: (object, key) => (object[key] = 0),
}

export const arrayOf = <E extends SchemaKey>(element: E): ArrayType<E> => ({
  __kind__: SchemaKeyKind.Array,
  __type__: element,
})
export const mapOf = <E extends SchemaKey>(element: E): MapType<E> => ({
  __kind__: SchemaKeyKind.Map,
  __type__: element,
})

export type SchemaKey = DataType | ArrayType<any> | MapType<any> | Schema
export type Schema = {
  [key: string]: SchemaKey
}

export type InstanceOfSchema<S extends Schema> = {
  [K in keyof S]: S[K] extends ArrayType<infer T>
    ? ExtractSchemaKeyType<T>[]
    : S[K] extends MapType<infer T>
    ? Record<string, ExtractSchemaKeyType<T>>
    : ExtractSchemaKeyType<S[K]> // everything else
}
export type ExtractSchemaKeyType<
  K extends SchemaKey
> = K extends DataTypePrimitive
  ? ReturnType<K["create"]>
  : K extends Schema
  ? InstanceOfSchema<K>
  : never

export const isPrimitiveType = (object: object): object is DataType =>
  "__kind__" in object &&
  (object as DataType).__kind__ === SchemaKeyKind.Primitive
export const isArrayType = (object: object): object is ArrayType =>
  "__kind__" in object && (object as ArrayType).__kind__ === SchemaKeyKind.Array
export const isMapType = (object: object): object is MapType =>
  "__kind__" in object && (object as MapType).__kind__ === SchemaKeyKind.Map

export type ModelConfig = Map<number, Schema>
export enum ModelNodeKind {
  Primitive,
  Struct,
  Array,
  Map,
}
export type ModelNodeBase = {
  id: number
  lo: number
  hi: number
  key?: string
  kind: ModelNodeKind
  inCollection: boolean
}
export type ModelNodeArray = ModelNodeBase & {
  edge: ModelNode
  kind: ModelNodeKind.Array
}
export type ModelNodeMap = ModelNodeBase & {
  edge: ModelNode
  kind: ModelNodeKind.Map
}
export type ModelNodeStruct = ModelNodeBase & {
  edges: ModelNode[]
  kind: ModelNodeKind.Struct
}
export type ModelNodePrimitive = ModelNodeBase & {
  type: DataType
  kind: ModelNodeKind.Primitive
}
export type ModelNode =
  | ModelNodeArray
  | ModelNodeMap
  | ModelNodeStruct
  | ModelNodePrimitive
export type Model = { [typeId: number]: ModelNodeStruct }

const localeCompare = (a: string, b: string) => a.localeCompare(b)

export const insertNode = (
  target: ModelNode,
  type: SchemaKey,
  ids: number,
  key?: string,
) => {
  const id = ++ids

  let kind: ModelNodeKind
  switch (type.__kind__) {
    case SchemaKeyKind.Array:
      kind = ModelNodeKind.Array
      break
    case SchemaKeyKind.Map:
      kind = ModelNodeKind.Map
      break
    case SchemaKeyKind.Primitive:
      kind = ModelNodeKind.Primitive
      break
    default:
      kind = ModelNodeKind.Struct
      break
  }

  const base: ModelNodeBase = {
    id,
    lo: id,
    hi: -1,
    inCollection:
      target.inCollection ||
      target.kind === ModelNodeKind.Array ||
      target.kind === ModelNodeKind.Map,
    kind,
    key,
  }

  let record: ModelNode

  if (isPrimitiveType(type)) {
    record = { ...base, kind: ModelNodeKind.Primitive, type }
  } else if (isArrayType(type)) {
    record = { ...base, kind: ModelNodeKind.Array } as ModelNodeArray
    ids = insertNode(record, type.__type__, ids)
  } else if (isMapType(type)) {
    record = { ...base, kind: ModelNodeKind.Map } as ModelNodeMap
    ids = insertNode(record, type.__type__, ids)
  } else {
    record = { ...base, kind: ModelNodeKind.Struct, edges: [] }
    ids = collateSchema(type as Schema, record, ids)
  }

  record.hi = ids

  if (key) {
    ;(target as ModelNodeStruct).edges.push(record)
  } else {
    ;(target as ModelNodeArray | ModelNodeMap).edge = record
  }

  return ids
}

export const collateSchema = (
  schema: Schema,
  target: ModelNodeStruct,
  ids = 0,
) => {
  // alphabetically sort keys since we can't guarantee order
  const keys = Object.keys(schema).sort(localeCompare)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = schema[key]
    ids = insertNode(target, value, ids, key)
  }

  target.hi = ids

  return ids
}

const getModelRoot = (): ModelNodeStruct => ({
  key: "",
  edges: [],
  id: 0,
  lo: 1,
  hi: Infinity,
  kind: ModelNodeKind.Struct,
  inCollection: false,
})

/**
 * createModel() produces a graph from a model and assigns each writable field
 * a unique integer id.
 *
 * @param config
 * @returns Model
 */
export const createModel = (config: ModelConfig): Model => {
  const model: Model = {}
  config.forEach((schema, typeId) => {
    const root = getModelRoot()
    collateSchema(schema, root)
    model[typeId] = root
  })
  return model
}
