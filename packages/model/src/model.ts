export enum DataTypeId {
  Number,
  Boolean,
  String,
  Array,
  Map,
}

export type DataType<I extends DataTypeId = DataTypeId> = { __data_type__: I }
export type DataTypeNumber = DataType<DataTypeId.Number> & {
  defaultValue: number
}
export type DataTypeString = DataType<DataTypeId.String> & {
  defaultValue: string
}
export type DataTypeBoolean = DataType<DataTypeId.Boolean> & {
  defaultValue: boolean
}
export type DataTypePrimitive =
  | DataTypeNumber
  | DataTypeString
  | DataTypeBoolean
export type DataTypeArray<E extends SchemaKey> = DataType<DataTypeId.Array> & {
  element: E
}
export type DataTypeMap<E extends SchemaKey> = DataType<DataTypeId.Map> & {
  element: E
}

export const number: DataTypeNumber = {
  __data_type__: DataTypeId.Number,
  defaultValue: 0,
}
export const string: DataTypeString = {
  __data_type__: DataTypeId.String,
  defaultValue: "",
}
export const boolean: DataTypeBoolean = {
  __data_type__: DataTypeId.Boolean,
  defaultValue: false,
}
export const arrayOf = <E extends SchemaKey>(element: E): DataTypeArray<E> => ({
  __data_type__: DataTypeId.Array,
  element,
})
export const mapOf = <E extends SchemaKey>(element: E): DataTypeMap<E> => ({
  __data_type__: DataTypeId.Map,
  element,
})

export type AnyDataType =
  | DataTypeNumber
  | DataTypeString
  | DataTypeBoolean
  | DataTypeArray<any>
  | DataTypeMap<any>

export type SchemaKey = AnyDataType | Schema
export type Schema = { [key: string]: SchemaKey }

export type InstanceOfSchema<S extends Schema> = {
  [K in keyof S]: S[K] extends DataTypeArray<infer T>
    ? ExtractSchemaKeyType<T>[] // array
    : S[K] extends DataTypeMap<infer T>
    ? Record<string, ExtractSchemaKeyType<T>> // map
    : ExtractSchemaKeyType<S[K]> // everything else
}
export type ExtractSchemaKeyType<
  W extends SchemaKey
> = W extends DataTypePrimitive
  ? W["defaultValue"]
  : W extends Schema
  ? InstanceOfSchema<W>
  : never

export const isDataType = (object: object): object is DataType =>
  "__data_type__" in object

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
  key: string
  kind: ModelNodeKind
  inCollection: boolean
}
export type ModelNodeField = ModelNodeBase & {
  type: DataType
}
export type ModelNodeStruct = ModelNodeBase & {
  keys: { [key: string]: ModelNode }
  edges: ModelNode[]
}
export type ModelNode = ModelNodeStruct | ModelNodeField
export type Model = { [typeId: number]: ModelNode }

const localeCompare = (a: string, b: string) => a.localeCompare(b)

export const collateSchema = (
  schema: Schema,
  target: ModelNodeStruct,
  ids = 0,
) => {
  // alphabetically sort keys since we can't guarantee order
  const keys = Object.keys(schema).sort(localeCompare)

  for (let i = 0; i < keys.length; i++) {
    const id = ++ids
    const key = keys[i]
    const value = schema[key]
    const base: ModelNodeBase = {
      id,
      key,
      lo: id,
      hi: -1,
      kind: ModelNodeKind.Primitive,
      inCollection: target.inCollection,
    }

    let record: ModelNode

    if (isDataType(value)) {
      switch (value.__data_type__) {
        case DataTypeId.Array:
        case DataTypeId.Map: {
          const kind =
            value.__data_type__ === DataTypeId.Array
              ? ModelNodeKind.Array
              : ModelNodeKind.Map
          base.inCollection = true
          if (isDataType(value.element)) {
            record = { ...base, hi: id, type: value.element, kind }
            // TODO: support nested arrays/maps, e.g.
            // arrayOf(arrayOf(number))
          } else {
            record = { ...base, edges: [], kind, keys: {} }
            ids = collateSchema(value.element, record, ids)
          }
          break
        }
        default:
          record = {
            ...base,
            hi: id,
            type: value,
          }
      }
    } else {
      record = {
        ...base,
        edges: [],
        kind: ModelNodeKind.Struct,
        keys: {},
      }
      ids = collateSchema(value, record, ids)
    }
    target.keys[key] = record
    target.edges.push(record)
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
  keys: {},
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

/**
 * patch() provides the means to update a schema instance (e.g. ECS component)
 * using a compressed patch.
 *
 * @param model
 * @param typeId
 * @param fieldId
 * @param instance
 * @param traverse
 * @param callback
 * @returns
 */
export const patch = (
  model: Model,
  typeId: number,
  fieldId: number,
  instance: any,
  traverse: number[] | string[],
  callback: (target: any, key: any) => unknown,
) => {
  const root = model[typeId] as ModelNodeStruct

  let t = 0
  let i = 0
  let parent: any = instance
  let record: ModelNodeStruct = root
  let node: ModelNode

  while ((node = record.edges[i])) {
    const { id, key, lo, hi, kind } = node

    if (fieldId === id) {
      callback(parent, key)
      return
    }

    if (lo <= fieldId && hi >= fieldId) {
      if (kind === ModelNodeKind.Array || kind === ModelNodeKind.Map) {
        parent = parent[key][traverse[t++]]
      } else {
        parent = parent[key]
      }
      record = node as ModelNodeStruct
      i = 0
    } else {
      i++
    }
  }

  throw new Error("Failed to patch object: key not found")
}
