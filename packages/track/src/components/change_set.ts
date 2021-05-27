import {
  arrayOf,
  boolean,
  dynamic,
  number,
  objectOf,
  string,
} from "@javelin/core"

export enum ChangeKind {
  Assign,
  Add,
  Set,
  Remove,
}

export const FieldRecord = {
  id: number,
  traverse: arrayOf(string),
}

export const Change = {
  kind: number,
  key: dynamic(),
  value: dynamic(),
  field: FieldRecord,
}

export const ChangeSet = {
  noop: boolean,
  changesBySchemaId: objectOf(arrayOf(Change)),
}
