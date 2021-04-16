import { createEffect } from "@javelin/ecs"
import { createMessage } from "../protocol"

export const effMessage = createEffect(world => {
  let message = createMessage(world.getModel())
  world.modelChanged.subscribe(model => {
    message.model = model
  })
  return function effMessage() {
    return message
  }
})
