import { SerializedComponentType } from "@javelin/net"

export function getComponentName(
  type: number,
  model: SerializedComponentType[],
) {
  return model.find(t => type === t.type)?.name
}
