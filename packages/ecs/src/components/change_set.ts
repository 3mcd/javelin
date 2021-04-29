import { arrayOf, dynamic, mapOf, number, string } from "@javelin/model"

const ChangeSetRecord = {
  field: number,
  traverse: arrayOf(string),
}

export const ChangeSet = {
  fields: mapOf({
    value: dynamic,
    record: ChangeSetRecord,
  }),
  array: arrayOf({
    path: string,
    method: number,
    record: ChangeSetRecord,
  }),
}
