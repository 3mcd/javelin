import { assert, ErrorType } from "./debug"

export enum SchemaKeyKind {
  Primitive,
  Array,
  Map,
  Dynamic,
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
export type DynamicType = {
  __kind__: SchemaKeyKind.Dynamic
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

export const dynamic: DynamicType = {
  __kind__: SchemaKeyKind.Dynamic,
}

export const arrayOf = <E extends SchemaKey>(element: E): ArrayType<E> => ({
  __kind__: SchemaKeyKind.Array,
  __type__: element,
})
export const mapOf = <E extends SchemaKey>(element: E): MapType<E> => ({
  __kind__: SchemaKeyKind.Map,
  __type__: element,
})

export type SchemaKey =
  | DataType
  | ArrayType<any>
  | MapType<any>
  | DynamicType
  | Schema
export type Schema = {
  [key: string]: SchemaKey
}

export type InstanceOfSchemaKey<K extends SchemaKey> = K extends ArrayType<
  infer T
>
  ? ExtractSchemaKeyType<T>[]
  : K extends MapType<infer T>
  ? Record<string, ExtractSchemaKeyType<T>>
  : K extends DynamicType
  ? unknown
  : ExtractSchemaKeyType<K> // everything else

export type InstanceOfSchema<S extends Schema> = {
  [K in keyof S]: InstanceOfSchemaKey<S[K]>
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
export const isDynamicType = (object: object): object is DynamicType =>
  "__kind__" in object &&
  (object as DynamicType).__kind__ === SchemaKeyKind.Dynamic

export type ModelConfig = Map<number, Schema>
export enum ModelNodeKind {
  Primitive,
  Struct,
  Array,
  Map,
  Dynamic,
}
export type ModelNodeBase = {
  id: number
  lo: number
  hi: number
  kind: ModelNodeKind
  inCollection: boolean
}
export type ModelNodeStructDescendant = ModelNode & {
  key: string
}
export type ModelNodeCollection = ModelNodeBase & {
  edge: ModelNode
}
export type ModelNodeArray = ModelNodeCollection & {
  kind: ModelNodeKind.Array
}
export type ModelNodeMap = ModelNodeCollection & {
  kind: ModelNodeKind.Map
}
export type ModelNodeStruct = ModelNodeBase & {
  edges: ModelNodeStructDescendant[]
  idsByKey: { [key: string]: number }
  keys: { [key: string]: ModelNodeStructDescendant }
  kind: ModelNodeKind.Struct
}
export type ModelNodePrimitive = ModelNodeBase & {
  type: DataType
  kind: ModelNodeKind.Primitive
}
export type ModelNodeDynamic = ModelNodeBase & {
  kind: ModelNodeKind.Dynamic
}
export type ModelNode =
  | ModelNodeArray
  | ModelNodeMap
  | ModelNodeStruct
  | ModelNodePrimitive
  | ModelNodeDynamic

export type Model = { [typeId: number]: ModelNodeStruct }
export type ModelFlat = { [typeId: number]: { [field: number]: ModelNode } }

function assertIsModelNodeStructDescendant(
  node: ModelNode,
): asserts node is ModelNodeStructDescendant {
  assert("key" in node, "", ErrorType.Internal)
}

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
    case SchemaKeyKind.Dynamic:
      kind = ModelNodeKind.Dynamic
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
  }

  let node: ModelNode | ModelNodeStructDescendant

  if (isPrimitiveType(type)) {
    node = { ...base, kind: ModelNodeKind.Primitive, type }
  } else if (isArrayType(type)) {
    node = { ...base, kind: ModelNodeKind.Array } as ModelNodeArray
    ids = insertNode(node, type.__type__, ids)
  } else if (isMapType(type)) {
    node = { ...base, kind: ModelNodeKind.Map } as ModelNodeMap
    ids = insertNode(node, type.__type__, ids)
  } else if (isDynamicType(type)) {
    node = { ...base, kind: ModelNodeKind.Dynamic }
  } else {
    node = {
      ...base,
      kind: ModelNodeKind.Struct,
      edges: [],
      keys: {},
      idsByKey: {},
    }
    ids = collate(type as Schema, node, ids)
  }

  node.hi = ids

  if (key) {
    ;(node as ModelNodeStructDescendant).key = key
    assert(
      target.kind === ModelNodeKind.Struct,
      "expected target node to be struct",
      ErrorType.Internal,
    )
    assertIsModelNodeStructDescendant(node)
    target.edges.push(node)
    target.keys[node.key] = node
    target.idsByKey[node.key] = id
  } else {
    assert(
      target.kind === ModelNodeKind.Array || target.kind === ModelNodeKind.Map,
      "expected target node to be collection",
      ErrorType.Internal,
    )
    target.edge = node
  }

  return ids
}

export const collate = (schema: Schema, target: ModelNodeStruct, ids = -1) => {
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
  edges: [],
  hi: Infinity,
  lo: -1,
  id: -1,
  idsByKey: {},
  inCollection: false,
  keys: {},
  kind: ModelNodeKind.Struct,
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
    collate(schema, root)
    model[typeId] = root
  })
  return model
}

export const flattenModelNode = (
  node: ModelNode,
  flat: ModelFlat[keyof ModelFlat],
) => {
  flat[node.id] = node
  switch (node.kind) {
    case ModelNodeKind.Array:
    case ModelNodeKind.Map:
      flattenModelNode(node.edge, flat)
      break
    case ModelNodeKind.Struct:
      for (let i = 0; i < node.edges.length; i++) {
        flattenModelNode(node.edges[i], flat)
      }
      break
  }
}

export const flattenModel = (model: Model): ModelFlat => {
  const flat: ModelFlat = {}
  for (const prop in model) {
    const sub = {} as ModelFlat[keyof ModelFlat]
    flattenModelNode(model[prop], sub)
    flat[prop] = sub
  }
  return flat
}
