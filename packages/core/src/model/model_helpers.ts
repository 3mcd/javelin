import { mutableEmpty } from "../utils"
import * as Model from "./model"

export const number: Model.FieldNumber = {
  [Model.$kind]: Model.FieldKind.Number,
  get: () => 0,
}
export const string: Model.FieldString = {
  [Model.$kind]: Model.FieldKind.String,
  get: () => "",
}
export const boolean: Model.FieldBoolean = {
  [Model.$kind]: Model.FieldKind.Boolean,
  get: () => false,
}

export function arrayOf<T extends Model.Field | Model.Schema>(
  element: T,
): Model.FieldArray<Model.FieldExtract<T>> {
  return {
    [Model.$kind]: Model.FieldKind.Array,
    get: (array = []) => mutableEmpty(array),
    element,
  }
}
export function objectOf<T extends Model.Field | Model.Schema>(
  element: T,
  key: Model.FieldString = string,
): Model.FieldObject<Model.FieldExtract<T>> {
  return {
    [Model.$kind]: Model.FieldKind.Object,
    get: (object = {}) => {
      for (const prop in object) {
        delete object[prop]
      }
      return object
    },
    key,
    element,
  }
}
export function setOf<T extends Model.Field | Model.Schema>(
  element: T,
): Model.FieldSet<Model.FieldExtract<T>> {
  return {
    [Model.$kind]: Model.FieldKind.Set,
    get: (set = new Set()) => {
      set.clear()
      return set
    },
    element,
  }
}
export function mapOf<K, V extends Model.Field | Model.Schema>(
  key: Model.FOf<K>,
  element: V,
): Model.FieldMap<K, Model.FieldExtract<V>> {
  return {
    [Model.$kind]: Model.FieldKind.Map,
    get: (map = new Map()) => {
      map.clear()
      return map
    },
    key,
    element,
  }
}
export function dynamic<T>(
  get: Model.FieldData<T>["get"] = () => null as unknown as T,
): Model.FieldDynamic<T> {
  return {
    [Model.$kind]: Model.FieldKind.Dynamic,
    get,
  }
}

export function isField(object: object): object is Model.FieldData<unknown> {
  return Model.$kind in object
}
export function isPrimitiveField(
  field: Model.FieldData<unknown>,
): field is Model.FieldPrimitive {
  const kind = field[Model.$kind]
  return (
    kind === Model.FieldKind.Number ||
    kind === Model.FieldKind.String ||
    kind === Model.FieldKind.Boolean ||
    kind === Model.FieldKind.Dynamic
  )
}

type Cursor = { id: number }

export function collate(
  visiting: Model.Schema | Model.FieldAny,
  cursor: Cursor,
  deep = false,
): Model.CollatedNode {
  let base: Model.CollatedNodeBase = {
    id: ++cursor.id,
    lo: cursor.id,
    hi: cursor.id,
    deep,
  }
  let node: Model.CollatedNode
  if (isField(visiting)) {
    node = { ...base, ...visiting }
    if ("element" in node) {
      node.element = collate(
        node.element as Model.Schema | Model.Field,
        cursor,
        true,
      ) as Model.Schema | Model.Field
    }
  } else {
    const keys = Object.keys(visiting)
    const fields: Model.CollatedNode[] = []
    const fieldsByKey: { [key: string]: Model.CollatedNode } = {}
    const fieldIdsByKey: { [key: string]: number } = {}
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const child = collate(visiting[key], cursor, deep)
      fieldsByKey[key] = child
      fieldIdsByKey[key] = child.id
      fields.push(child)
    }
    node = {
      ...base,
      keys,
      fields,
      fieldsByKey,
      fieldIdsByKey,
    }
  }
  node.hi = cursor.id
  return node
}

type ModelConfig = Map<number, Model.Schema | Model.Field>

export function flattenModelNode(
  node: Model.CollatedNode,
  flat: Model.Model[typeof Model.$flat],
) {
  flat[node.id] = node
  if (isField(node)) {
    if ("element" in node) {
      flattenModelNode(node.element as Model.CollatedNode, flat)
    }
  } else {
    for (let i = 0; i < node.fields.length; i++) {
      flattenModelNode(node.fields[i], flat)
    }
  }
}

export function flattenModel(
  model: Omit<Model.Model, typeof Model.$flat>,
): Model.ModelFlat {
  const flat: Model.Model[typeof Model.$flat] = {}
  for (const prop in model) {
    flattenModelNode(model[prop], (flat[prop] = {}))
  }
  return flat
}

/**
 * createModel() produces a graph from a model and assigns each writable field
 * a unique integer id.
 *
 * @param config
 * @returns Model
 */
export function createModel(config: ModelConfig): Model.Model {
  const model: Omit<Model.Model, typeof Model.$flat> = {}
  const cursor = { id: -1 }
  config.forEach((sf, t) => {
    cursor.id = -1
    model[t] = collate(sf, cursor)
  })
  return Object.defineProperty(model, Model.$flat, {
    enumerable: false,
    writable: false,
    value: flattenModel(model),
  })
}

export function initializeWithSchema<T extends Model.Schema>(
  object: Model.FieldExtract<T>,
  schema: T,
): Model.FieldExtract<T> {
  for (const prop in schema) {
    const type = schema[prop]
    let value: unknown
    if (isField(type)) {
      value = type.get()
    } else {
      value = initializeWithSchema({}, type as Model.Schema)
    }
    object[prop] = value as Model.FieldExtract<T>[Extract<keyof T, string>]
  }
  return object
}

export function resetWithSchema<T extends Model.Schema>(
  object: Model.FieldExtract<T>,
  schema: T,
) {
  for (const prop in schema) {
    const type = schema[prop]
    if (isField(type)) {
      object[prop] = type.get(object[prop]) as Model.FieldExtract<T>[Extract<
        keyof T,
        string
      >]
    } else {
      resetWithSchema(
        object[prop] as Model.FieldExtract<T>,
        type as Model.Schema,
      )
    }
  }
  return object
}
