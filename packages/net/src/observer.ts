import { Component, mutableEmpty } from "@javelin/ecs"
import { flattenSchema, Model, SchemaStructRecord } from "./protocol_v2"

function flattenModel(model: Model) {
  const normalized: any = {}
  model.forEach((schema, id) => {
    const root = { id: 0, cid: id, type: {}, parent: null }
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

export function observerCache(model: Model) {
  const tmp_indices: number[] = []
  const flat = flattenModel(model)
  const handler = {
    get(t: any, k: any) {
      const {
        [k]: v,
        _record: { array },
      } = t

      if (typeof v === "object" && v !== null) {
        if (array) {
          ;(v as Test)._index = k
        }

        ;(v as Test)._parent = t
        return observe(v, t, k)
      }

      return v
    },
    set(t: any, k: any, v: any) {
      mutableEmpty(tmp_indices)
      if (t._record.array) {
        tmp_indices.push(k)
      }
      let p = t
      while (p !== undefined) {
        const { _parent, _index } = p
        if (_parent && _parent._record.array) {
          if (k !== undefined) {
            tmp_indices.unshift(_index)
          }
        }

        p = _parent
      }

      // const { cid, type } = t._record
      // console.log(cid, t._record.array ? type.id : type[k].id, v, idc)

      t[k] = v

      return true
    },
  }
  const observe = (o: object, p?: Test, k?: string) => {
    if ((o as any).proxy === undefined) {
      ;(o as Test)._record =
        p === undefined
          ? flat[(o as Component)._tid]
          : Array.isArray(p)
          ? p._record.type
          : (p._record.type[k as string] as any)
      ;(o as any).proxy = new Proxy(o, handler)
    }

    return (o as any).proxy
  }
  return {
    observe,
  }
}
