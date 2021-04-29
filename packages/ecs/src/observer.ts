import {
  ModelNode,
  ModelNodeKind,
  ModelNodeStruct,
  mutableEmpty,
} from "@javelin/model"
import { Component } from "./component"
import { UNSAFE_internals } from "./internal"
import { createStackPool } from "./pool"

// const arrayOpPool = createStackPool<ObserverArrayOp>(
//   () =>
//     (({
//       method: -1,
//       record: null,
//       values: [],
//     } as unknown) as ObserverArrayOp),
//   op => {
//     op.method = -1
//     op.record = (null as unknown) as ObserverChangeRecord
//     mutableEmpty((op as ArrayOpInsert).values)
//     return op
//   },
//   10000,
// )

export enum MutArrayMethod {
  Pop,
  Push,
  Shift,
  Unshift,
  Splice,
}
export type ArrayOpBase = {
  method: MutArrayMethod
  record: ObserverChangeRecord
}
export type ObserverChangeRecord = {
  field: number
  path: string
  split: string[]
  traverse: string[]
}
export type ObserverChange = {
  noop: boolean
  value: unknown
  record: ObserverChangeRecord
}
type ArrayOpInsert = ArrayOpBase & {
  values: unknown[]
}
type ArrayOpPop = ArrayOpBase & { method: MutArrayMethod.Pop }
type ArrayOpShift = ArrayOpBase & { method: MutArrayMethod.Shift }
type ArrayOpPush = ArrayOpInsert & { method: MutArrayMethod.Push }
type ArrayOpUnshift = ArrayOpInsert & { method: MutArrayMethod.Unshift }
type ArrayOpSplice = ArrayOpInsert & {
  method: MutArrayMethod.Splice
  index: number
  remove: number
}
export type ObserverArrayOp =
  | ArrayOpPop
  | ArrayOpShift
  | ArrayOpPush
  | ArrayOpUnshift
  | ArrayOpSplice
export type ObserverChangeSet = {
  object: Record<string, ObserverChange>
  objectCount: number
  array: ObserverArrayOp[]
  arrayCount: number
}
// export type Observer = {
//   track(component: Component, path: string, value: unknown): void
//   trackPop(component: Component, path: string): void
//   trackPush(component: Component, path: string, ...values: unknown[]): void
//   trackShift(component: Component, path: string): void
//   trackUnshift(component: Component, path: string, ...values: unknown[]): void
//   trackSplice(
//     component: Component,
//     path: string,
//     index: number,
//     remove: number,
//     ...values: unknown[]
//   ): void
//   empty(component: Component): void
//   reset(component: Component): void
//   clear(): void
//   changesOf(component: Component): ObserverChangeSet | null
// }

// const PATH_DELIMITER = "."
// const recordLookup: Record<number, Record<string, ObserverChangeRecord>> = {}

// export const createObserverChangeSet = () => ({
//   object: {},
//   objectCount: 0,
//   array: [],
//   arrayCount: 0,
// })

// export const resetObserverChangeSet = (changes: ObserverChangeSet) => {
//   const { array, object } = changes
//   let arrayOp: ObserverArrayOp | undefined
//   while ((arrayOp = array.pop())) {
//     arrayOpPool.release(arrayOp)
//   }
//   for (const prop in object) {
//     object[prop].noop = true
//   }
//   changes.objectCount = 0
//   changes.arrayCount = 0
// }

// const getRecord = (component: Component, path: string) => {
//   const { __type__: type } = component
//   const root = UNSAFE_internals.__MODEL__[type]
//   let records = recordLookup[type]
//   if (records === undefined) {
//     records = recordLookup[type] = {}
//   }
//   let record = records[path]
//   if (record === undefined) {
//     let node: ModelNode = root
//     const traverse: string[] = []
//     const split = path.split(PATH_DELIMITER)
//     for (let i = 0; i < split.length; i++) {
//       const sub = split[i]
//       switch (node.kind) {
//         case ModelNodeKind.Array:
//         case ModelNodeKind.Map:
//           node = node.edge
//           traverse.push(sub)
//           break
//         case ModelNodeKind.Struct:
//           node = node.keys[sub]
//           break
//       }
//     }
//     records[path] = record = { traverse, path, split, field: node.id }
//   }
//   return record
// }

// const track = (component: Component, path: string, value: unknown) => {
//   const record = getRecord(component, path)
//   const changes = component[$componentChanges]
//   const change = changes.object[path]
//   if (change) {
//     if (change.noop) {
//       change.noop = false
//       changes.objectCount++
//     }
//     change.value = value
//   } else {
//     changes.objectCount++
//     changes.object[path] = { record, value, noop: false }
//   }
// }

// function trackPop(component: Component, path: string) {
//   const record = getRecord(component, path)
//   const changes = component[$componentChanges]
//   const arrayOp = arrayOpPool.retain()
//   arrayOp.record = record
//   arrayOp.method = MutArrayMethod.Pop
//   changes.arrayCount++
//   changes.array.push(arrayOp)
// }

// function trackPush(component: Component, path: string) {
//   const record = getRecord(component, path)
//   const changes = component[$componentChanges]
//   const arrayOp = arrayOpPool.retain() as ArrayOpPush
//   arrayOp.record = record
//   arrayOp.method = MutArrayMethod.Push
//   for (let i = 2; i < arguments.length; i++) {
//     arrayOp.values.push(arguments[i])
//   }
//   changes.arrayCount++
//   changes.array.push(arrayOp)
// }

// function trackShift(component: Component, path: string) {
//   const record = getRecord(component, path)
//   const changes = component[$componentChanges]
//   const arrayOp = arrayOpPool.retain()
//   arrayOp.record = record
//   arrayOp.method = MutArrayMethod.Shift
//   changes.arrayCount++
//   changes.array.push(arrayOp)
// }

// function trackUnshift(component: Component, path: string) {
//   const record = getRecord(component, path)
//   const changes = component[$componentChanges]
//   const arrayOp = arrayOpPool.retain() as ArrayOpUnshift
//   arrayOp.record = record
//   arrayOp.method = MutArrayMethod.Unshift
//   for (let i = 2; i < arguments.length; i++) {
//     arrayOp.values.push(arguments[i])
//   }
//   changes.arrayCount++
//   changes.array.push(arrayOp)
// }

// function trackSplice(
//   component: Component,
//   path: string,
//   index: number,
//   remove: number,
// ) {
//   const record = getRecord(component, path)
//   const changes = component[$componentChanges]
//   const arrayOp = arrayOpPool.retain() as ArrayOpSplice
//   arrayOp.record = record
//   arrayOp.method = MutArrayMethod.Splice
//   arrayOp.index = index
//   arrayOp.remove = remove
//   for (let i = 2; i < arguments.length; i++) {
//     arrayOp.values.push(arguments[i])
//   }
//   changes.arrayCount++
//   changes.array.push(arrayOp)
// }

// const changesOf = (component: Component) => component[$componentChanges]
