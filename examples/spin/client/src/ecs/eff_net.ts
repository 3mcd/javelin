import { createEffect } from "@javelin/ecs"
import { createMessageHandler } from "@javelin/net"
import { Client } from "@web-udp/client"
import { world } from "./world"

export const effNet = createEffect(
  () => {
    const state = {
      bytes: 0,
    }
    const remote = createMessageHandler(world)
    const client = new Client({
      url: `${window.location.hostname}:8000`,
    })

    client.connect().then(c =>
      c.messages.subscribe(message => {
        state.bytes += message.byteLength
        remote.push(message)
      }),
    )

    return () => {
      remote.system()
      return Object.assign(state, remote.useInfo())
    }
  },
  { global: true },
)
