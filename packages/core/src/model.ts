import { assert, ErrorType } from "./debug"

export const $flat = Symbol("javelin_model_flat")
export const $schema = Symbol("javelin_model_struct")

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
export type MapType<
  K extends DataTypeNumber | DataTypeString = DataTypeNumber | DataTypeString,
  E extends SchemaKey = SchemaKey,
> = {
  __kind__: SchemaKeyKind.Map
  __type__: E
  __key__: K
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

export const arrayOf = <T extends SchemaKey>(element: T): ArrayType<T> => ({
  __kind__: SchemaKeyKind.Array,
  __type__: element,
})
export const objectOf = <T extends SchemaKey>(element: T): ObjectType<T> => ({
  __kind__: SchemaKeyKind.Object,
  __type__: element,
})
export const mapOf = <
  K extends DataTypeNumber | DataTypeString,
  T extends SchemaKey,
>(
  key: K,
  element: T,
): MapType<K, T> => ({
  __kind__: SchemaKeyKind.Map,
  __type__: element,
  __key__: key,
})
export const setOf = <T extends SchemaKey>(element: T): SetType<T> => ({
  __kind__: SchemaKeyKind.Set,
  __type__: element,
})

export type SchemaKey =
  | DataType
  | ArrayType<any>
  | ObjectType<any>
  | SetType<any>
  | MapType<any, any>
  | Schema
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

export type ExtractSchemaKeyType<K extends SchemaKey> =
  K extends DataTypePrimitive
    ? ReturnType<K["create"]>
    : K extends ArrayType<infer _>
    ? ExtractSchemaKeyType<_>[]
    : K extends ObjectType<infer _>
    ? { [key: string]: ExtractSchemaKeyType<_> }
    : K extends SetType<infer _>
    ? Set<ExtractSchemaKeyType<_>>
    : K extends MapType<infer K, infer V>
    ? Map<ExtractSchemaKeyType<K>, ExtractSchemaKeyType<V>>
    : K extends Schema
    ? InstanceOfSchema<K>
    : never

export type ModelConfig = Map<number, Schema>
export type ModelNodeBase = {
  id: number
  lo: number
  hi: number
  kind: SchemaKeyKind | typeof $schema
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
  kind: typeof $schema
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

function localeCompare(a: string, b: string) {
  return a.localeCompare(b)
}

export function insertNode(
  target: ModelNode,
  type: SchemaKey,
  ids: number,
  key?: string,
) {
  const id = ++ids
  const kind = "__kind__" in type ? (type.__kind__ as SchemaKeyKind) : $schema
  const base: ModelNodeBase = {
    id,
    lo: id,
    hi: -1,
    inCollection:
      target.inCollection ||
      (target.kind !== SchemaKeyKind.Primitive && target.kind !== $schema),
    kind,
  }

  let node: ModelNode

  if (kind === $schema) {
    node = {
      ...base,
      edges: [],
      keys: {},
      idsByKey: {},
    } as ModelNodeSchema
    ids = collateSchema(type as Schema, node, ids)
  } else {
    if (type.__kind__ === SchemaKeyKind.Primitive) {
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
      target.kind === $schema,
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

export function collateSchema(
  schema: Schema,
  target: ModelNodeSchema,
  ids = -1,
) {
  const keys = Object.keys(schema).sort(localeCompare)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const type = schema[key]
    ids = insertNode(target, type, ids, key)
  }

  target.hi = ids

  return ids
}

function createRootModelNode(): ModelNodeSchema {
  return {
    edges: [],
    hi: Infinity,
    lo: -1,
    id: -1,
    idsByKey: {},
    inCollection: false,
    keys: {},
    kind: $schema,
  }
}

/**
 * createModel() produces a graph from a model and assigns each writable field
 * a unique integer id.
 *
 * @param config
 * @returns Model
 */
export function createModel(config: ModelConfig): Model {
  const model: Model = { [$flat]: {} }
  config.forEach((schema, typeId) => {
    const root = createRootModelNode()
    collateSchema(schema, root)
    model[typeId] = root
  })
  Object.defineProperty(model, $flat, {
    enumerable: false,
    writable: false,
    value: flattenModel(model),
  })
  return model
}

export function flattenModelNode(
  node: ModelNode,
  flat: ModelFlat[keyof ModelFlat],
) {
  flat[node.id] = node
  switch (node.kind) {
    case SchemaKeyKind.Array:
    case SchemaKeyKind.Object:
    case SchemaKeyKind.Set:
    case SchemaKeyKind.Map:
      flattenModelNode(node.edge, flat)
      break
    case $schema:
      for (let i = 0; i < node.edges.length; i++) {
        flattenModelNode(node.edges[i], flat)
      }
      break
  }
}

export function flattenModel(model: Model): ModelFlat {
  const flat: ModelFlat = {}
  for (const prop in model) {
    const sub = {} as ModelFlat[keyof ModelFlat]
    flattenModelNode(model[prop], sub)
    flat[prop] = sub
  }
  return flat
}
