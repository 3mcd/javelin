import {
  assert,
  InstanceOfSchema,
  ModelFlat,
  ModelNodeKind,
} from "@javelin/model"
import { dataTypeToView, uint16, uint8 } from "@javelin/pack"
import { MutArrayMethod, ChangeSet } from "@javelin/track"

export const calcChangeByteLength = (
  changes: InstanceOfSchema<typeof ChangeSet>,
  type: ModelFlat[keyof ModelFlat],
) => {
  const { fields, array } = changes

  // fields count + array count
  let byteLength = uint8.byteLength * 2

  for (const prop in fields) {
    const change = fields[prop]
    if (change.noop) {
      continue
    }
    const {
      record: { field, traverse },
    } = change
    // field + traverse length + traverse keys
    byteLength +=
      uint8.byteLength * 2 + uint16.byteLength * (traverse?.length ?? 0)
    // value
    const node = type[field]
    assert(
      node.kind === ModelNodeKind.Primitive,
      "Failed to encode change: only primitive field mutations are currently supported",
    )
    byteLength += dataTypeToView(node.type).byteLength
  }

  for (let i = 0; i < array.length; i++) {
    const change = array[i]
    const {
      record: { field, traverse },
    } = change
    // field + traverse length + traverse keys
    byteLength +=
      uint8.byteLength * 2 + uint16.byteLength * (traverse?.length ?? 0)
    // array method
    byteLength += uint8.byteLength
    if (
      change.method === MutArrayMethod.Pop ||
      change.method === MutArrayMethod.Shift
    ) {
      continue
    }
    // insert length
    byteLength += uint8.byteLength

    const node = type[field]
    assert(
      node.kind === ModelNodeKind.Primitive,
      "Failed to encode change: only primitive field mutations are currently supported",
    )

    // insert values
    byteLength += dataTypeToView(node.type).byteLength * change.values.length

    if (change.method === MutArrayMethod.Splice) {
      // index + remove
      byteLength += uint16.byteLength + uint8.byteLength
    }
  }

  return byteLength
}
