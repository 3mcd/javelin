# `@javelin/net`

Networking protocol and utilities for Javelin ECS.

## MessageBuilder

```ts
const model = world.getModel()
const builder = createMessageBuilder(model)

builder.spawn()
builder.attach()
builder.detach()
builder.destroy()
builder.update()
builder.patch()

builder.encode()
```

```ts
import { eff_observe } from "@javelin/ecs"

const sys_physics = () => {
  const observe = eff_observe()

  qry_bodies.forEach((entity, [body]) => {
    const body_o = observe(body)
    body_o.x = 1
    body_o.y = 2
  })
}

import { eff_observe, eff_interval } from "@javelin/ecs"
import { eff_message } from "@javelin/net"
import { eff_clients } from "./effects"

const sys_net_server = () => {
  const send = eff_interval((1 / 20) * 1000)
  const observe = eff_observe()
  const message = eff_message()
  const clients = eff_clients()

  if (send) {
    qry_bodies.forEach((entity, [body]) => {
      const changes = observe.changes.get(body)
      message.patch(entity, body, changes)
      changes.reset(body)
    })

    for (const client of clients) {
      client.send_u(message.encode())
    }
    message.reset()
  }
}
```

## MessageHandler

```ts
import { eff_message_handler } from "@javelin/net"

const sys_net_client = () => {
  const {
    remote: { tick }, // get remote (server) world details
    patched, // entities patched last message
    updated, // entities synced last message
  } = eff_message_handler()
}
```
