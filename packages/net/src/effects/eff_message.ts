import { createEffect, modelChanged, globals } from "@javelin/ecs"
import { createMessage } from "../protocol"

export const effMessage = createEffect(world => {
  let message = createMessage(globals.__MODEL__)
  modelChanged.subscribe(model => {
    message.model = model
  })
  return function effMessage() {
    return message
  }
})
