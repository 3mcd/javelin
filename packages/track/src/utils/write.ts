import {
  $kind,
  assert,
  CollatedNode,
  createStackPool,
  FieldExtract,
  FieldKind,
  isField,
  mutableEmpty,
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
  Record<string, FieldExtract<typeof ChangeSetRecord>>
> = {}
const arrayOpPool = createStackPool<FieldExtract<typeof ChangeSetArrayOp>>(
  () => ({
    method: -1,
    record: null as unknown as FieldExtract<typeof ChangeSetRecord>,
    values: [],
    start: -1,
    insert: -1,
    deleteCount: -1,
  }),
  op => {
    op.method = -1
    op.record = null as unknown as FieldExtract<typeof ChangeSetRecord>
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
    let node: CollatedNode = UNSAFE_internals.model[type]
    const traverse: string[] = []
    const split = path.split(PATH_DELIMITER)
    for (let i = 0; i < split.length; i++) {
      const sub = split[i]
      if (isField(node)) {
        switch (node[$kind]) {
          case FieldKind.Array:
          case FieldKind.Object:
            assert("element" in node)
            node = node.element as CollatedNode
            traverse.push(sub)
            break
        }
      } else {
        node = node.fieldsByKey[sub]
      }
    }
    records[path] = record = { traverse, path, split, field: node.id }
  }
  return record
}

function getOrCreateChanges(
  changeset: FieldExtract<typeof ChangeSet>,
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

export function reset(changeset: FieldExtract<typeof ChangeSet>) {
  for (const prop in changeset.changes) {
    const changes = changeset.changes[prop]
    const { array, fields } = changes
    let arrayOp: FieldExtract<typeof ChangeSetArrayOp> | undefined
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
  from: FieldExtract<typeof ChangeSet>,
  to: FieldExtract<typeof ChangeSet>,
) {
  if (from.touched === false) {
    return
  }
  to.touched = true
  for (const schemaId in from.changes) {
    const changesFrom = from.changes[schemaId]
    let changesTo = to.changes[schemaId]
    if (changesTo === undefined) {
      changesTo = to.changes[schemaId] = {
        fields: {},
        array: [],
        fieldCount: 0,
        arrayCount: 0,
      }
    }
    if (changesFrom.fieldCount + changesFrom.arrayCount === 0) {
      continue
    }
    if (changesTo.fieldCount + changesTo.arrayCount === 0) {
      to.size++
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
      } else {
        if (changeTo.noop) {
          changesTo.fieldCount++
        }
        changeTo.noop = changeFrom.noop
        changeTo.record = changeFrom.record
        changeTo.value = changeFrom.value
      }
    }
    for (let i = 0; i < changesFrom.array.length; i++) {
      changesTo.array.push({
        ...changesFrom.array[i],
        values: changesFrom.array[i].values.slice(),
      })
      changesTo.arrayCount++
    }
  }
  return to
}

export function set(
  component: Component,
  changeset: FieldExtract<typeof ChangeSet>,
  path: string,
  value: unknown,
) {
  const changes = getOrCreateChanges(changeset, component.__type__)
  if (changes.fieldCount + changes.fieldCount === 0) {
    changeset.size++
  }
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
}

export function push(
  component: Component,
  changeset: FieldExtract<typeof ChangeSet>,
  path: string,
  ...values: unknown[]
): void
export function push(
  component: Component,
  changeset: FieldExtract<typeof ChangeSet>,
  path: string,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  if (changes.fieldCount + changes.arrayCount === 0) {
    changeset.size++
  }
  const arrayOp: FieldExtract<typeof ChangeSetArrayOp> = {
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
}

export function pop(
  component: Component,
  changeset: FieldExtract<typeof ChangeSet>,
  path: string,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  if (changes.fieldCount + changes.arrayCount === 0) {
    changeset.size++
  }
  const arrayOp: FieldExtract<typeof ChangeSetArrayOp> = {
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
}

export function unshift(
  component: Component,
  changeset: FieldExtract<typeof ChangeSet>,
  path: string,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  if (changes.fieldCount + changes.arrayCount === 0) {
    changeset.size++
  }
  const arrayOp: FieldExtract<typeof ChangeSetArrayOp> = {
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
}

export function shift(
  component: Component,
  changeset: FieldExtract<typeof ChangeSet>,
  path: string,
) {
  const record = getRecord(component, path)
  const { split } = record
  let o: any = component
  for (let i = 0, end = split.length; i < end; i++) {
    o = o[split[i]]
  }
  const changes = getOrCreateChanges(changeset, component.__type__)
  if (changes.fieldCount + changes.arrayCount === 0) {
    changeset.size++
  }
  const arrayOp: FieldExtract<typeof ChangeSetArrayOp> = {
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
}

export function splice(
  component: Component,
  changeset: FieldExtract<typeof ChangeSet>,
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
  if (changes.fieldCount + changes.arrayCount === 0) {
    changeset.size++
  }
  const arrayOp: FieldExtract<typeof ChangeSetArrayOp> = {
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
}
