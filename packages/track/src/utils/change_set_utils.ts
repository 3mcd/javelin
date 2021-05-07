import { Component, ComponentOf, UNSAFE_internals } from "@javelin/ecs"
import {
  createStackPool,
  InstanceOfSchema,
  ModelNode,
  ModelNodeKind,
  mutableEmpty,
} from "@javelin/model"
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
    index: -1,
    insert: -1,
    remove: -1,
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
  const root = UNSAFE_internals.model[type]
  let records = recordLookup[type]
  if (records === undefined) {
    records = recordLookup[type] = {}
  }
  let record = records[path]
  if (record === undefined) {
    let node: ModelNode = root
    const traverse: string[] = []
    const split = path.split(PATH_DELIMITER)
    for (let i = 0; i < split.length; i++) {
      const sub = split[i]
      switch (node.kind) {
        case ModelNodeKind.Array:
        case ModelNodeKind.Map:
          node = node.edge
          traverse.push(sub)
          break
        case ModelNodeKind.Struct:
          node = node.keys[sub]
          break
      }
    }
    records[path] = record = { traverse, path, split, field: node.id }
  }
  return record
}

function getOrCreateChanges(
  changeSet: InstanceOfSchema<typeof ChangeSet>,
  schemaId: number,
) {
  let changes = changeSet.changes[schemaId]
  if (changes === undefined) {
    changes = changeSet.changes[schemaId] = {
      fields: {},
      array: [],
      fieldCount: 0,
      arrayCount: 0,
    }
  }
  return changes
}

export const track = (
  changeSet: InstanceOfSchema<typeof ChangeSet>,
  component: Component,
  path: string,
  value: unknown,
) => {
  const changes = getOrCreateChanges(changeSet, component.__type__)
  const change = changes.fields[path]
  if (change !== undefined) {
    if (change.noop) {
      change.noop = false
      changes.fieldCount++
      changeSet.length++
    }
    change.value = value
  } else {
    const record = getRecord(component, path)
    changes.fieldCount++
    changeSet.length++
    changes.fields[path] = { record, value, noop: false }
  }
}

export const trackPop = (
  changeSet: InstanceOfSchema<typeof ChangeSet>,
  component: Component,
  path: string,
) => {
  const changes = getOrCreateChanges(changeSet, component.__type__)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = getRecord(component, path)
  arrayOp.method = MutArrayMethod.Pop
  changeSet.length++
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export function trackPush(
  changeSet: InstanceOfSchema<typeof ChangeSet>,
  component: Component,
  path: string,
) {
  const changes = getOrCreateChanges(changeSet, component.__type__)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = getRecord(component, path)
  arrayOp.method = MutArrayMethod.Push
  for (let i = 2; i < arguments.length; i++) {
    arrayOp.values.push(arguments[i])
  }
  changeSet.length++
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export const trackShift = (
  changeSet: InstanceOfSchema<typeof ChangeSet>,
  component: Component,
  path: string,
) => {
  const changes = getOrCreateChanges(changeSet, component.__type__)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = getRecord(component, path)
  arrayOp.method = MutArrayMethod.Shift
  changeSet.length++
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export function trackUnshift(
  changeSet: InstanceOfSchema<typeof ChangeSet>,
  component: Component,
  path: string,
) {
  const changes = getOrCreateChanges(changeSet, component.__type__)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = getRecord(component, path)
  arrayOp.method = MutArrayMethod.Unshift
  for (let i = 2; i < arguments.length; i++) {
    arrayOp.values.push(arguments[i])
  }
  changeSet.length++
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export function trackSplice(
  changeSet: InstanceOfSchema<typeof ChangeSet>,
  component: Component,
  path: string,
  index: number,
  remove: number,
) {
  const changes = getOrCreateChanges(changeSet, component.__type__)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = getRecord(component, path)
  arrayOp.method = MutArrayMethod.Splice
  arrayOp.index = index
  arrayOp.remove = remove
  for (let i = 2; i < arguments.length; i++) {
    arrayOp.values.push(arguments[i])
  }
  changeSet.length++
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export function reset(changeSet: InstanceOfSchema<typeof ChangeSet>) {
  for (const prop in changeSet.changes) {
    const changes = changeSet.changes[prop]
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
  changeSet.length = 0
}

export function copy(
  from: InstanceOfSchema<typeof ChangeSet>,
  to: InstanceOfSchema<typeof ChangeSet>,
) {
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
        to.length++
      } else {
        changeTo.noop = changeFrom.noop
        changeTo.record = changeFrom.record
        changeTo.value = changeFrom.value
      }
    }
  }
  return to
}
