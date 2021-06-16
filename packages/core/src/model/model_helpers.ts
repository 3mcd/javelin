import { mutableEmpty } from "../utils"
import {
  $flat,
  $kind,
  CollatedNode,
  CollatedNodeBase,
  CollatedNodeSchema,
  Field,
  FieldAny,
  FieldArray,
  FieldBoolean,
  FieldData,
  FieldDynamic,
  FieldExtract,
  FieldKind,
  FieldMap,
  FieldNumber,
  FieldObject,
  FieldOf,
  FieldPrimitive,
  FieldSet,
  FieldString,
  Model,
  ModelFlat,
  Schema,
} from "./model"

/**
 * Object used in a Schema to declare a numeric field.
 * @example
 * const Wallet = { money: number }
 */
export const number: FieldNumber = {
  [$kind]: FieldKind.Number,
  get: () => 0,
}
/**
 * Object used in a Schema to declare a string field.
 * @example
 * const Book = { title: string }
 */
export const string: FieldString = {
  [$kind]: FieldKind.String,
  get: () => "",
}
/**
 * Object used in a Schema to declare a boolean field.
 * @example
 * const Controller = { jumping: boolean }
 */
export const boolean: FieldBoolean = {
  [$kind]: FieldKind.Boolean,
  get: () => false,
}
/**
 * Build a field that represents an array within a Schema. The sole parameter
 * defines the array's element type, which can be another field or Schema.
 * @param element
 * @returns
 * @example <caption>primitive element</caption>
 * const Bag = { items: arrayOf(number) }
 * @example <caption>complex element</caption>
 * const Shape = { vertices: arrayOf(arrayOf(number)) }
 */
export function arrayOf<T extends Field | Schema>(
  element: T,
): FieldArray<FieldExtract<T>> {
  return {
    [$kind]: FieldKind.Array,
    get: (array = []) => mutableEmpty(array),
    element,
  }
}
/**
 * Build a field that represents an object within a Schema. The first parameter
 * defines the object's element type, which can be another field or Schema. If
 * provided, the second argument will override the default key type of `string`
 * with another field derived from `string`.
 * @param element
 * @returns
 * @example <caption>primitive element</caption>
 * const Stats = { values: objectOf(number) }
 * @example <caption>`key` type override (e.g. for `@javelin/pack` encoding)</caption>
 * const Stat = { min: number, max: number, value: number }
 * const Stats = { values: objectOf(Stat, { ...string, length: 20 }) }
 */
export function objectOf<T extends Field | Schema>(
  element: T,
  key: FieldString = string,
): FieldObject<FieldExtract<T>> {
  return {
    [$kind]: FieldKind.Object,
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
/**
 * Build a field that represents an Set within a Schema. The sole parameter
 * defines the Set's element type, which can be another field or Schema.
 * @param element
 * @returns
 * @example <caption>primitive element</caption>
 * const Buffs = { values: setOf(number) }
 * @example <caption>complex element</caption>
 * const Body = { colliders: setOf(Collider) }
 */
export function setOf<T extends Field | Schema>(
  element: T,
): FieldSet<FieldExtract<T>> {
  return {
    [$kind]: FieldKind.Set,
    get: (set = new Set()) => {
      set.clear()
      return set
    },
    element,
  }
}
/**
 * Build a field that represents an Map within a Schema. The first parameter
 * defines the Map's key type, which must be a primitive field. The second
 * argument defines the Map's value type, which can be a field or schema.
 * @param element
 * @returns
 * @example <caption>primitive element</caption>
 * const Disabled = { entities: mapOf(number, boolean) }
 * @example <caption>complex element</caption>
 * const PrivateChat = { messagesByClientId: mapOf(string, arrayOf(ChatMessage)) }
 */
export function mapOf<K, V extends Field | Schema>(
  key: FieldOf<K>,
  element: V,
): FieldMap<K, FieldExtract<V>> {
  return {
    [$kind]: FieldKind.Map,
    get: (map = new Map()) => {
      map.clear()
      return map
    },
    key,
    element,
  }
}
/**
 * Build a field that represents an unknown type in a Schema. Accepts an
 * optional parameter which is a factory function that returns an initial
 * value for each field.
 * @param element
 * @returns
 * @example <caption>`unknown` type</caption>
 * const RigidBody = { value: dynamic() }
 * @example <caption>library type</caption>
 * const RigidBody = { value: dynamic(() => new Rapier.RigidBody()) }
 */
export function dynamic<T>(
  get: FieldData<T>["get"] = () => null as unknown as T,
): FieldDynamic<T> {
  return {
    [$kind]: FieldKind.Dynamic,
    get,
  }
}

export function isField<T>(object: object): object is FieldData<T> {
  return $kind in object
}
export function isSchema<T>(
  node: CollatedNode<T>,
): node is CollatedNodeSchema<T> {
  return !($kind in node)
}
export function isPrimitiveField(object: object): object is FieldPrimitive {
  if (!isField(object)) {
    return false
  }
  const kind = object[$kind]
  return (
    kind === FieldKind.Number ||
    kind === FieldKind.String ||
    kind === FieldKind.Boolean ||
    kind === FieldKind.Dynamic
  )
}

type Cursor = { id: number }

export function collate<T>(
  visiting: Schema | FieldAny,
  cursor: Cursor,
  traverse: (FieldString | FieldNumber)[] = [],
): CollatedNode<T> {
  let base: CollatedNodeBase = {
    id: ++cursor.id,
    lo: cursor.id,
    hi: cursor.id,
    deep: traverse.length > 0,
    traverse,
  }
  let node: CollatedNode<T>
  if (isField(visiting)) {
    node = { ...base, ...visiting }
    if ("element" in node) {
      node.element = collate(
        node.element as Schema | Field,
        cursor,
        "key" in node
          ? [...traverse, node.key as FieldString | FieldNumber]
          : traverse,
      ) as Schema | Field
    }
  } else {
    const keys = Object.keys(visiting)
    const keysByFieldId: string[] = []
    const fields: CollatedNode<T>[] = []
    const fieldsByKey: { [key: string]: CollatedNode<T> } = {}
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

type ModelConfig = Map<number, Schema | Field>

export function flattenModelNode(
  node: CollatedNode,
  flat: Model[typeof $flat],
) {
  flat[node.id] = node
  if (isField(node)) {
    if ("element" in node) {
      flattenModelNode(node.element as CollatedNode<unknown>, flat)
    }
  } else {
    for (let i = 0; i < node.fields.length; i++) {
      flattenModelNode(node.fields[i], flat)
    }
  }
}

export function flattenModel<T>(
  model: Omit<Model, typeof $flat>,
): ModelFlat<T> {
  const flat: Model[typeof $flat] = {}
  for (const prop in model) {
    flattenModelNode(model[prop], (flat[prop] = {}))
  }
  return flat
}

/**
 * Produce a graph from a model and assign each writable field a unique integer
 * id.
 * @param config
 * @returns Model
 */
export function createModel<T>(config: ModelConfig): Model<T> {
  const model: Omit<Model, typeof $flat> = {}
  const cursor = { id: -1 }
  config.forEach((sf, t) => {
    cursor.id = -1
    model[t] = collate(sf, cursor)
  })
  return Object.defineProperty(model, $flat, {
    enumerable: false,
    writable: false,
    value: flattenModel(model),
  }) as Model<T>
}

export function initializeWithSchema<T extends Schema>(
  object: FieldExtract<T>,
  schema: T,
): FieldExtract<T> {
  for (const prop in schema) {
    const type = schema[prop]
    let value: unknown
    if (isField(type)) {
      value = type.get()
    } else {
      value = initializeWithSchema({}, type as Schema)
    }
    object[prop] = value as FieldExtract<T>[Extract<keyof T, string>]
  }
  return object
}

export function resetWithSchema<T extends Schema>(
  object: FieldExtract<T>,
  schema: T,
) {
  for (const prop in schema) {
    const type = schema[prop]
    if (isField(type)) {
      object[prop] = type.get(object[prop]) as FieldExtract<T>[Extract<
        keyof T,
        string
      >]
    } else {
      resetWithSchema(object[prop] as FieldExtract<T>, type as Schema)
    }
  }
  return object
}

export function isSimple(node: CollatedNode): boolean {
  if (isSchema(node)) {
    return node.fields.every(isPrimitiveField)
  } else if ("element" in node) {
    return isPrimitiveField(node.element as FieldData<unknown>)
  }
  return true
}
