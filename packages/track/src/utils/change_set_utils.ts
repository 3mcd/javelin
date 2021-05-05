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
  const root = UNSAFE_internals.__MODEL__[type]
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

export const track = (
  changes: ComponentOf<typeof ChangeSet>,
  component: Component,
  path: string,
  value: unknown,
) => {
  const change = changes.fields[path]
  if (change !== undefined) {
    if (change.noop) {
      change.noop = false
      changes.fieldCount++
    }
    change.value = value
  } else {
    const record = getRecord(component, path)
    changes.fieldCount++
    changes.fields[path] = { record, value, noop: false }
  }
}

export const trackPop = (
  changes: ComponentOf<typeof ChangeSet>,
  component: Component,
  path: string,
) => {
  const record = getRecord(component, path)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = record
  arrayOp.method = MutArrayMethod.Pop
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export function trackPush(
  changes: ComponentOf<typeof ChangeSet>,
  component: Component,
  path: string,
) {
  const record = getRecord(component, path)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = record
  arrayOp.method = MutArrayMethod.Push
  for (let i = 2; i < arguments.length; i++) {
    arrayOp.values.push(arguments[i])
  }
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export const trackShift = (
  changes: ComponentOf<typeof ChangeSet>,
  component: Component,
  path: string,
) => {
  const record = getRecord(component, path)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = record
  arrayOp.method = MutArrayMethod.Shift
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export function trackUnshift(
  changes: ComponentOf<typeof ChangeSet>,
  component: Component,
  path: string,
) {
  const record = getRecord(component, path)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = record
  arrayOp.method = MutArrayMethod.Unshift
  for (let i = 2; i < arguments.length; i++) {
    arrayOp.values.push(arguments[i])
  }
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export function trackSplice(
  changes: ComponentOf<typeof ChangeSet>,
  component: Component,
  path: string,
  index: number,
  remove: number,
) {
  const record = getRecord(component, path)
  const arrayOp = arrayOpPool.retain()
  arrayOp.record = record
  arrayOp.method = MutArrayMethod.Splice
  arrayOp.index = index
  arrayOp.remove = remove
  for (let i = 2; i < arguments.length; i++) {
    arrayOp.values.push(arguments[i])
  }
  changes.arrayCount++
  changes.array.push(arrayOp)
}

export const reset = (changes: ComponentOf<typeof ChangeSet>) => {
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
