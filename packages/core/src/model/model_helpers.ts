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

export function isField(object: object): object is Model.Field {
  return Model.$kind in object
}
export function isFieldData<T>(object: object): object is Model.FieldData<T> {
  return Model.$kind in object
}
export function isSchema<T>(
  node: Model.CollatedNode<T>,
): node is Model.CollatedNodeSchema<T> {
  return !(Model.$kind in node)
}
export function isPrimitiveField(
  object: object,
): object is Model.FieldPrimitive {
  if (!isField(object)) {
    return false
  }
  const kind = object[Model.$kind]
  return (
    kind === Model.FieldKind.Number ||
    kind === Model.FieldKind.String ||
    kind === Model.FieldKind.Boolean ||
    kind === Model.FieldKind.Dynamic
  )
}

type Cursor = { id: number }

export function collate<T>(
  visiting: Model.Schema | Model.FieldAny,
  cursor: Cursor,
  traverse: (Model.FieldString | Model.FieldNumber)[] = [],
): Model.CollatedNode<T> {
  let base: Model.CollatedNodeBase = {
    id: ++cursor.id,
    lo: cursor.id,
    hi: cursor.id,
    deep: traverse.length > 0,
    traverse,
  }
  let node: Model.CollatedNode<T>
  if (isField(visiting)) {
    node = { ...base, ...visiting }
    if ("element" in node) {
      node.element = collate(
        node.element as Model.Schema | Model.Field,
        cursor,
        "key" in node
          ? [...traverse, node.key as Model.FieldString | Model.FieldNumber]
          : traverse,
      ) as Model.Schema | Model.Field
    }
  } else {
    const keys = Object.keys(visiting)
    const keysByFieldId: string[] = []
    const fields: Model.CollatedNode<T>[] = []
    const fieldsByKey: { [key: string]: Model.CollatedNode<T> } = {}
    const fieldIdsByKey: { [key: string]: number } = {}
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const child = collate(visiting[key], cursor, traverse)
      keysByFieldId[child.id] = key
      fieldsByKey[key] = child
      fieldIdsByKey[key] = child.id
      fields.push(child)
    }
    node = {
      ...base,
      keys,
      keysByFieldId,
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
      flattenModelNode(node.element as Model.CollatedNode<unknown>, flat)
    }
  } else {
    for (let i = 0; i < node.fields.length; i++) {
      flattenModelNode(node.fields[i], flat)
    }
  }
}

export function flattenModel<T>(
  model: Omit<Model.Model, typeof Model.$flat>,
): Model.ModelFlat<T> {
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
export function createModel<T>(config: ModelConfig): Model.Model<T> {
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
    if (isFieldData(type)) {
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
    if (isFieldData(type)) {
      object[prop] = type.get(
        object[prop] as any,
      ) as Model.FieldExtract<T>[Extract<keyof T, string>]
    } else {
      resetWithSchema(
        object[prop] as Model.FieldExtract<T>,
        type as Model.Schema,
      )
    }
  }
  return object
}

export function isSimple(node: Model.CollatedNode): boolean {
  if (isSchema(node)) {
    return node.fields.every(isPrimitiveField)
  } else if ("element" in node) {
    return isPrimitiveField(node.element as Model.FieldData<unknown>)
  }
  return true
}
