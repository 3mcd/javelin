import {
  $kind,
  assert,
  CollatedNode,
  FieldExtract,
  FieldKind,
  isField,
} from "@javelin/core"
import { Component, UNSAFE_internals } from "@javelin/ecs"
import { FieldRecord } from "../components"

const PATH_DELIMITER = "."

const cache: Record<number, Record<string, FieldExtract<typeof FieldRecord>>> =
  {}

export const getFieldRecord = (component: Component, path: string) => {
  const { __type__: type } = component
  let records = cache[type]
  if (records === undefined) {
    records = cache[type] = {}
  }
  let record = records[path]
  if (record === undefined) {
    let node: CollatedNode = UNSAFE_internals.model[type]
    const traverse: string[] = []
    const split = path.split(PATH_DELIMITER)
    for (let i = 0; i < split.length; i++) {
      const sub = split[i]
      if (isField(node)) {
        switch (node[$kind]) {
          case FieldKind.Array:
          case FieldKind.Object:
          case FieldKind.Map:
            assert("element" in node)
            node = node.element as CollatedNode
            traverse.push(sub)
            break
        }
      } else {
        node = node.fieldsByKey[sub]
      }
    }
    records[path] = record = { id: node.id, traverse }
  }
  return record
}
