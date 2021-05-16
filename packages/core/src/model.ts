import { assert, ErrorType } from "./debug"

export const $flat = Symbol("javelin_model_flat")
export const $struct = Symbol("javelin_model_struct")

export enum SchemaKeyKind {
  Primitive,
  Array,
  Object,
  Set,
  Map,
}

export enum DataTypeId {
  Number = "number",
  Boolean = "boolean",
  String = "string",
  Dynamic = "dynamic",
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
export type ObjectType<E extends SchemaKey = SchemaKey> = {
  __kind__: SchemaKeyKind.Object
  __type__: E
}
export type SetType<E extends SchemaKey = SchemaKey> = {
  __kind__: SchemaKeyKind.Set
  __type__: E
}
export type MapType<E extends SchemaKey = SchemaKey> = {
  __kind__: SchemaKeyKind.Map
  __type__: E
  __key__: DataTypeNumber | DataTypeString
}
export type DataTypeNumber = DataType<number>
export type DataTypeString = DataType<string>
export type DataTypeBoolean = DataType<boolean>
export type DataTypeDynamic = DataType<unknown>
export type DataTypePrimitive =
  | DataTypeNumber
  | DataTypeString
  | DataTypeBoolean
  | DataTypeDynamic

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
export const dynamic: DataTypeDynamic = {
  __kind__: SchemaKeyKind.Primitive,
  __type__: DataTypeId.Dynamic,
  create: () => null,
  reset: (object, key) => (object[key] = null),
}

export const arrayOf = <E extends SchemaKey>(element: E): ArrayType<E> => ({
  __kind__: SchemaKeyKind.Array,
  __type__: element,
})
export const objectOf = <E extends SchemaKey>(element: E): ObjectType<E> => ({
  __kind__: SchemaKeyKind.Object,
  __type__: element,
})
export const mapOf = <
  E extends SchemaKey,
  K extends DataTypeNumber | DataTypeString
>(
  element: E,
  key: K,
): MapType<E> => ({
  __kind__: SchemaKeyKind.Map,
  __type__: element,
  __key__: key,
})
export const setOf = <E extends SchemaKey>(element: E) => ({
  __kind__: SchemaKeyKind.Set,
  __type__: element,
})

export type SchemaKey = DataType | ArrayType<any> | ObjectType<any> | Schema
export type Schema = {
  [key: string]: SchemaKey
}

export type InstanceOfSchemaKey<K extends SchemaKey> = K extends ArrayType<
  infer T
>
  ? ExtractSchemaKeyType<T>[]
  : K extends ObjectType<infer T>
  ? Record<string, ExtractSchemaKeyType<T>>
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
export const isObjectType = (object: object): object is ObjectType =>
  "__kind__" in object &&
  (object as ObjectType).__kind__ === SchemaKeyKind.Object
export const isSetType = (object: object): object is SetType =>
  "__kind__" in object && (object as SetType).__kind__ === SchemaKeyKind.Set
export const isMapType = (object: object): object is MapType =>
  "__kind__" in object && (object as MapType).__kind__ === SchemaKeyKind.Map

export type ModelConfig = Map<number, Schema>
export type ModelNodeBase = {
  id: number
  lo: number
  hi: number
  kind: SchemaKeyKind | typeof $struct
  inCollection: boolean
}
export type ModelNodeSchemaDescendant = ModelNode & {
  key: string
}
export type ModelNodeCollection = ModelNodeBase & {
  edge: ModelNode
}
export type ModelNodeArray = ModelNodeCollection & {
  kind: SchemaKeyKind.Array
}
export type ModelNodeObject = ModelNodeCollection & {
  kind: SchemaKeyKind.Object
}
export type ModelNodeSet = ModelNodeCollection & {
  kind: SchemaKeyKind.Set
}
export type ModelNodeMap = ModelNodeCollection & {
  key: DataTypeNumber | DataTypeString
  kind: SchemaKeyKind.Map
}
export type ModelNodeSchema = ModelNodeBase & {
  edges: ModelNodeSchemaDescendant[]
  idsByKey: { [key: string]: number }
  keys: { [key: string]: ModelNodeSchemaDescendant }
  kind: typeof $struct
}
export type ModelNodePrimitive = ModelNodeBase & {
  type: DataType
  kind: SchemaKeyKind.Primitive
}
export type ModelNode =
  | ModelNodePrimitive
  | ModelNodeArray
  | ModelNodeObject
  | ModelNodeSet
  | ModelNodeMap
  | ModelNodeSchema

export type ModelFlat = { [typeId: number]: { [field: number]: ModelNode } }
export type Model = { [typeId: number]: ModelNodeSchema; [$flat]: ModelFlat }

function assertIsModelNodeSchemaDescendant(
  node: ModelNode,
): asserts node is ModelNodeSchemaDescendant {
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
  const kind = "__kind__" in type ? (type.__kind__ as SchemaKeyKind) : $struct
  const base: ModelNodeBase = {
    id,
    lo: id,
    hi: -1,
    inCollection:
      target.inCollection ||
      target.kind === SchemaKeyKind.Array ||
      target.kind === SchemaKeyKind.Object ||
      target.kind === SchemaKeyKind.Set ||
      target.kind === SchemaKeyKind.Map,
    kind,
  }

  let node: ModelNode

  if (kind === $struct) {
    node = {
      ...base,
      edges: [],
      keys: {},
      idsByKey: {},
    } as ModelNodeSchema
    ids = collate(type as Schema, node, ids)
  } else {
    if (isPrimitiveType(type)) {
      node = { ...base, type } as ModelNode
    } else {
      node = { ...base } as ModelNode
      ids = insertNode(node, type.__type__, ids)
    }
  }

  node.hi = ids

  if (key) {
    ;(node as ModelNodeSchemaDescendant).key = key
    assert(
      target.kind === $struct,
      "expected target node to be struct",
      ErrorType.Internal,
    )
    assertIsModelNodeSchemaDescendant(node)
    target.edges.push(node)
    target.keys[node.key] = node
    target.idsByKey[node.key] = id
  } else {
    assert(
      target.kind === SchemaKeyKind.Array ||
        target.kind === SchemaKeyKind.Object ||
        target.kind === SchemaKeyKind.Set ||
        target.kind === SchemaKeyKind.Map,
      `expected target node to be collection but got ${String(target.kind)}`,
      ErrorType.Internal,
    )
    target.edge = node
  }

  return ids
}

export const collate = (schema: Schema, target: ModelNodeSchema, ids = -1) => {
  const keys = Object.keys(schema).sort(localeCompare)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const type = schema[key]
    ids = insertNode(target, type, ids, key)
  }

  target.hi = ids

  return ids
}

const getModelRoot = (): ModelNodeSchema => ({
  edges: [],
  hi: Infinity,
  lo: -1,
  id: -1,
  idsByKey: {},
  inCollection: false,
  keys: {},
  kind: $struct,
})

/**
 * createModel() produces a graph from a model and assigns each writable field
 * a unique integer id.
 *
 * @param config
 * @returns Model
 */
export const createModel = (config: ModelConfig): Model => {
  const model: Model = { [$flat]: {} }
  config.forEach((schema, typeId) => {
    const root = getModelRoot()
    collate(schema, root)
    model[typeId] = root
  })
  Object.defineProperty(model, $flat, {
    enumerable: false,
    writable: false,
    value: flattenModel(model),
  })
  return model
}

export const flattenModelNode = (
  node: ModelNode,
  flat: ModelFlat[keyof ModelFlat],
) => {
  flat[node.id] = node
  switch (node.kind) {
    case SchemaKeyKind.Array:
    case SchemaKeyKind.Object:
    case SchemaKeyKind.Set:
    case SchemaKeyKind.Map:
      flattenModelNode(node.edge, flat)
      break
    case $struct:
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
