import {
  $struct,
  createStackPool,
  InstanceOfSchema,
  ModelNode,
  mutableEmpty,
  SchemaKeyKind,
} from "@javelin/core"
import { Component, UNSAFE_internals } from "@javelin/ecs"
import {
  ChangeSet,
  ChangeSetArrayOp,
  ChangeSetRecord,
} from "../components/change_set"
import { MutArrayMethod } from "../types"

const PATH_DELIMITER = "."
const recordLookup: Record<
  number,
  Record<string, InstanceOfSchema<typeof ChangeSetRecord>>
> = {}
const arrayOpPool = createStackPool<InstanceOfSchema<typeof ChangeSetArrayOp>>(
  () => ({
    method: -1,
    record: (null as unknown) as InstanceOfSchema<typeof ChangeSetRecord>,
    values: [],
    start: -1,
    insert: -1,
    deleteCount: -1,
  }),
  op => {
    op.method = -1
    op.record = (null as unknown) as InstanceOfSchema<typeof ChangeSetRecord>
    mutableEmpty(op.values)
    return op
  },
  10000,
)

const getRecord = (component: Component, path: string) => {
  const { __type__: type } = component
  let records = recordLookup[type]
  if (records === undefined) {
    records = recordLookup[type] = {}
  }
  let record = records[path]
  if (record === undefined) {
    let node: ModelNode = UNSAFE_internals.model[type]
    const traverse: string[] = []
    const split = path.split(PATH_DELIMITER)
    for (let i = 0; i < split.length; i++) {
      const sub = split[i]
      switch (node.kind) {
        case SchemaKeyKind.Array:
        case SchemaKeyKind.Object:
          node = node.edge
          traverse.push(sub)
          break
        case $struct:
          node = node.keys[sub]
          break
      }
    }
    records[path] = record = { traverse, path, split, field: node.id }
  }
  return record
}

function getOrCreateChanges(
  changeset: InstanceOfSchema<typeof ChangeSet>,
  schemaId: number,
) {
  let changes = changeset.changes[schemaId]
  if (changes === undefined) {
    changes = changeset.changes[schemaId] = {
      fields: {},
      array: [],
      fieldCount: 0,
      arrayCount: 0,
    }
  }
  return changes
}

export function reset(changeset: InstanceOfSchema<typeof ChangeSet>) {
  for (const prop in changeset.changes) {
    const changes = changeset.changes[prop]
    const { array, fields } = changes
    let arrayOp: InstanceOfSchema<typeof ChangeSetArrayOp> | undefined
    while ((arrayOp = array.pop())) {
      arrayOpPool.release(arrayOp)
    }
    for (const prop in fields) {
      fields[prop].noop = true
    }
    changes.fieldCount = 0
    changes.arrayCount = 0
  }
  changeset.size = 0
  changeset.touched = false
}

export function copy(
  from: InstanceOfSchema<typeof ChangeSet>,
  to: InstanceOfSchema<typeof ChangeSet>,
) {
  if (from.touched === false) {
    return
  }
  to.touched = true
  for (const prop in from.changes) {
    const changesFrom = from.changes[prop]
    let changesTo = to.changes[prop]
    if (changesTo === undefined) {
      changesTo = to.changes[prop] = {
        fields: {},
        array: [],
        fieldCount: 0,
        arrayCount: 0,
      }
    }
    for (const field in changesFrom.fields) {
      const changeFrom = changesFrom.fields[field]
      if (changeFrom.noop) {
        continue
      }
      let changeTo = changesTo.fields[field]
      if (changeTo === undefined) {
        changeTo = changesTo.fields[field] = {
          noop: changeFrom.noop,
          record: changeFrom.record,
          value: changeFrom.value,
        }
        changesTo.fieldCount++
        to.size++
      } else {
        if (changeTo.noop) {
          changesTo.fieldCount++
          to.size++
        }
        changeTo.noop = changeFrom.noop
        changeTo.record = changeFrom.record
        changeTo.value = changeFrom.value
      }
    }
  }
  return to
}

export function set(
  component: Component,
  changeset: InstanceOfSchema<typeof ChangeSet>,
  path: string,
  value: unknown,
) {
  const changes = getOrCreateChanges(changeset, component.__type__)
  const change = changes.fields[path]
  const record = getRecord(component, path)
  if (change !== undefined) {
    if (change.noop) {
      change.noop = false
      changes.fieldCount++
    }
    change.value = value
  } else {
    changes.fieldCount++
    changes.fields[path] = { record, value, noop: false }
  }
  const { split } = record
  const end = split.length - 1
  let i: number
  let o: any = component
  for (i = 0; i < end; i++) {
    o = o[split[i]]
  }
  o[split[i]] = value
  changeset.touched = true
  changeset.size++
}

export function push(
  component: Component,
  changeset: InstanceOfSchema<typeof ChangeSet>,
  path: string,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  const arrayOp: InstanceOfSchema<typeof ChangeSetArrayOp> = {
    values: [],
    record,
    method: MutArrayMethod.Push,
    start: -1,
    deleteCount: 0,
  }
  for (let i = 3; i < arguments.length; i++) {
    const value = arguments[i]
    ;(o as unknown[]).push(value)
    arrayOp.values.push(value)
  }
  changes.arrayCount++
  changes.array.push(arrayOp)
  changeset.touched = true
  changeset.size++
}

export function pop(
  component: Component,
  changeset: InstanceOfSchema<typeof ChangeSet>,
  path: string,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  const arrayOp: InstanceOfSchema<typeof ChangeSetArrayOp> = {
    values: [],
    record,
    method: MutArrayMethod.Pop,
    start: -1,
    deleteCount: 0,
  }
  ;(o as unknown[]).pop()
  changes.arrayCount++
  changes.array.push(arrayOp)
  changeset.touched = true
  changeset.size++
}

export function unshift(
  component: Component,
  changeset: InstanceOfSchema<typeof ChangeSet>,
  path: string,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  const arrayOp: InstanceOfSchema<typeof ChangeSetArrayOp> = {
    values: [],
    record,
    method: MutArrayMethod.Unshift,
    start: -1,
    deleteCount: 0,
  }
  for (let i = 3; i < arguments.length; i++) {
    const value = arguments[i]
    ;(o as unknown[]).unshift(value)
    arrayOp.values.push(value)
  }
  changes.arrayCount++
  changes.array.push(arrayOp)
  changeset.touched = true
  changeset.size++
}

export function shift(
  component: Component,
  changeset: InstanceOfSchema<typeof ChangeSet>,
  path: string,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  const arrayOp: InstanceOfSchema<typeof ChangeSetArrayOp> = {
    values: [],
    record,
    method: MutArrayMethod.Shift,
    start: -1,
    deleteCount: 0,
  }
  ;(o as unknown[]).shift()
  changes.arrayCount++
  changes.array.push(arrayOp)
  changeset.touched = true
  changeset.size++
}

export function splice(
  component: Component,
  changeset: InstanceOfSchema<typeof ChangeSet>,
  path: string,
  start: number,
  deleteCount: number,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  const arrayOp: InstanceOfSchema<typeof ChangeSetArrayOp> = {
    values: [],
    record,
    method: MutArrayMethod.Splice,
    start,
    deleteCount,
  }
  for (let i = 5; i < arguments.length; i++) {
    arrayOp.values.push(arguments[i])
  }
  ;(o as unknown[]).splice(start, deleteCount, ...arrayOp.values)
  changes.arrayCount++
  changes.array.push(arrayOp)
  changeset.touched = true
  changeset.size++
}
