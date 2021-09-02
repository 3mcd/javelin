import { createEffect, UNSAFE_internals, World } from "@javelin/ecs"
import { enhanceModel } from "@javelin/pack"
import { decode, DecodeState } from "./decode"

export const createMessageHandler = (world: World) => {
  const cursor = { offset: 0 }
  const messages: ArrayBuffer[] = []
  const decodeState: DecodeState = {
    world,
    model: enhanceModel(UNSAFE_internals.model),
    localByRemote: new Map(),
    updatedEntities: new Set(),
  }
  const push = (message: ArrayBuffer) => messages.unshift(message)
  const system = () => {
    let message: ArrayBuffer | undefined
    while ((message = messages.pop())) {
      decode(message, decodeState, cursor)
    }
  }
  const useInfo = createEffect(() => () => decodeState, {
    shared: true,
  })

  return {
    push,
    system,
    useInfo,
  }
}
