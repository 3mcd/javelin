import {
  arrayOf,
  boolean,
  dynamic,
  mapOf,
  number,
  string,
} from "@javelin/model"

export const ChangeSetRecord = {
  path: string,
  field: number,
  split: arrayOf(string),
  traverse: arrayOf(string),
}

export const ChangeSetArrayOp = {
  method: number,
  record: ChangeSetRecord,
  values: arrayOf(dynamic),
  index: number,
  insert: number,
  remove: number,
}

export const ChangeSet = {
  changes: mapOf({
    fields: mapOf({
      noop: boolean,
      value: dynamic,
      record: ChangeSetRecord,
    }),
    array: arrayOf(ChangeSetArrayOp),
    fieldCount: number,
    arrayCount: number,
  }),
  length: number,
}
