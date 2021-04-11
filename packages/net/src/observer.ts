import { Component, mutableEmpty } from "@javelin/ecs"
import { isField } from "@javelin/pack"
import {
  flattenSchema,
  Model,
  SchemaStructRecord,
  SchemaRecord,
} from "./protocol_v2"

function flattenModel(model: Model) {
  const normalized: { [componentTypeId: number]: SchemaStructRecord } = {}
  model.forEach((schema, id) => {
    const root = { id: 0, cid: id, type: {}, parent: null, in_array: false }
    flattenSchema(schema, root)
    normalized[id] = root
  })
  return normalized
}

type Test<T = unknown> = T & {
  _index: number
  _parent: any
  _record: SchemaStructRecord
}

const tmp_indices: number[] = []
const recordIsArray = (record: SchemaRecord) =>
  "array" in record && record.array === true
const recordIsChildOfArray = (record: SchemaRecord) =>
  "in_array" in record && record.in_array === true

export function createObserver(model: Model, onChange: (object: object) => {}) {
  const flat = flattenModel(model)
  const cache = new WeakMap()
  const createHandler = (record: SchemaRecord) => {
    const { type } = record

    let get
    let set

    if (isField(type)) {
      get = (target: any, key: any) => target[key]
    } else if (recordIsArray(record) && recordIsChildOfArray(record)) {
      get = (target: any, key: any) => {
        const value = target[key]
        value._index = key
        value._parent = target
        return observe(value, target, record, key)
      }
    } else if (recordIsArray(record)) {
      get = (target: any, key: any) => {
        const value = target[key]
        value._index = key
        return observe(value, target, record, key)
      }
    } else if (recordIsChildOfArray(record)) {
      get = (target: any, key: any) => {
        const value = target[key]
        value._parent = target
        return observe(value, target, record, key)
      }
    } else {
      get = (target: any, key: any) => observe(target[key], target, record, key)
    }

    if (recordIsArray(record) && recordIsChildOfArray(record)) {
      set = (target: any, key: any, value: any) => {
        mutableEmpty(tmp_indices)
        tmp_indices.push(key)
        let parent = target
        while (parent !== undefined) {
          const { _parent, _index } = parent
          if (_index !== undefined) {
            tmp_indices.push(_index)
          }
          parent = _parent
        }

        onChange(record)

        target[key] = value
        return true
      }
    } else if (recordIsChildOfArray(record)) {
      set = (target: any, key: any, value: any) => {
        mutableEmpty(tmp_indices)
        let parent = target
        while (parent !== undefined) {
          const { _parent, _index } = parent
          if (_index !== undefined) {
            tmp_indices.push(_index)
          }
          parent = _parent
        }

        onChange(record)

        target[key] = value
        return true
      }
    } else {
      set = (target: any, key: any, value: any) => {
        target[key] = value
        onChange(record)
        return true
      }
    }

    return { get, set }
  }
  const observe = (
    object: any,
    parent?: Test,
    parentRecord?: any,
    key?: string,
  ) => {
    let proxy = cache.get(object)
    if (proxy === undefined) {
      const record =
        parent === undefined
          ? flat[(object as Component)._tid]
          : Array.isArray(parent)
          ? parentRecord.type
          : (parentRecord.type[key as string] as any)
      proxy = new Proxy(object, createHandler(record))
      cache.set(object, proxy)
    }

    return proxy
  }
  return {
    observe,
  }
}
