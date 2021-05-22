import {
  arrayOf,
  boolean,
  dynamic,
  number,
  objectOf,
  string,
} from "@javelin/core"

export const ChangeSetRecord = {
  path: string,
  field: number,
  split: arrayOf(string),
  traverse: arrayOf(string),
}

export const ChangeSetArrayOp = {
  method: number,
  record: ChangeSetRecord,
  values: arrayOf(dynamic()),
  start: number,
  deleteCount: number,
}

export const ChangeSet = {
  changes: objectOf({
    fields: objectOf({
      noop: boolean,
      value: dynamic(),
      record: ChangeSetRecord,
    }),
    array: arrayOf(ChangeSetArrayOp),
    fieldCount: number,
    arrayCount: number,
  }),
  size: number,
  touched: boolean,
}
