import { createStackPool, FieldExtract, mutableEmpty } from "@javelin/core"
import { Component } from "@javelin/ecs"
import { ChangeKind, ChangeSet, Change } from "../components/change_set"
import { applyChange } from "./apply"
import { getFieldRecord } from "./record"

export type Read<O, T extends string> = O extends { [key: string]: unknown }
  ? O[T]
  : O extends Map<infer _, infer V>
  ? V
  : never

export type Split<T> = T extends ""
  ? []
  : T extends `${infer First}.${infer Rest}`
  ? [First, ...Split<Rest>]
  : [T]

type Traverse<O extends Component, X extends string[]> = X extends []
  ? O
  : X extends [infer First, ...infer Rest]
  ? // @ts-expect-error
    Traverse<Read<O, First>, Rest>
  : never

type ValueAt<O> = O extends { [key: string]: infer T }
  ? T
  : O extends Map<unknown, infer V>
  ? V
  : O extends (infer T)[]
  ? T
  : O

type KeyAt<O> = O extends { [key: string]: unknown }
  ? string
  : O extends Map<infer K, unknown>
  ? K
  : O extends unknown[]
  ? number
  : never

const changePool = createStackPool(
  () =>
    ({
      kind: -1,
      key: -1,
      field: null,
      value: null,
    } as unknown as FieldExtract<typeof Change>),
  c => {
    c.kind = -1
    c.key = -1
    c.field = null as any
    c.value = null as unknown
    return c
  },
  1000,
)

function getOrCreateChanges(
  changeSet: FieldExtract<typeof ChangeSet>,
  component: Component,
) {
  const { __type__: schemaId } = component
  let changes = changeSet.changesBySchemaId[schemaId]
  if (changes === undefined) {
    changes = changeSet.changesBySchemaId[schemaId] = []
  }
  return changes
}

export function assign<C extends Component, P extends string>(
  changeSet: FieldExtract<typeof ChangeSet>,
  component: C,
  path: P,
  value: Traverse<C, Split<P>>,
) {
  const change = changePool.retain()
  const kind = ChangeKind.Assign
  const record = getFieldRecord(component, path)
  change.kind = kind
  change.field = record
  change.key = null
  change.value = value
  getOrCreateChanges(changeSet, component).push(change)
  applyChange(component, kind, record.id, record.traverse, value, null)
  changeSet.noop = false
}

export function set<C extends Component, P extends string>(
  changeSet: FieldExtract<typeof ChangeSet>,
  component: C,
  path: P,
  key: KeyAt<Traverse<C, Split<P>>>,
  value: ValueAt<Traverse<C, Split<P>>>,
) {
  const change = changePool.retain()
  const kind = ChangeKind.Set
  const record = getFieldRecord(component, path)
  change.kind = kind
  change.field = record
  change.key = key
  change.value = value
  getOrCreateChanges(changeSet, component).push(change)
  applyChange(component, kind, record.id, record.traverse, value, key)
  changeSet.noop = false
}

export function add(
  changeSet: FieldExtract<typeof ChangeSet>,
  component: Component,
  path: string,
  value: unknown,
) {
  getOrCreateChanges(changeSet, component).push({
    kind: ChangeKind.Add,
    field: getFieldRecord(component, path),
    key: null,
    value,
  })
  changeSet.noop = false
}

export function remove(
  changeSet: FieldExtract<typeof ChangeSet>,
  component: Component,
  path: string,
  value: unknown,
) {
  getOrCreateChanges(changeSet, component).push({
    kind: ChangeKind.Remove,
    field: getFieldRecord(component, path),
    key: null,
    value,
  })
  changeSet.noop = false
}

export function reset(changeSet: FieldExtract<typeof ChangeSet>) {
  if (changeSet.noop) return
  const { changesBySchemaId } = changeSet
  for (const prop in changesBySchemaId) {
    mutableEmpty(changesBySchemaId[prop])
  }
  changeSet.noop = true
}
