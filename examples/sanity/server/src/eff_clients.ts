import { component, createEffect, Entity } from "@javelin/ecs"
import { Player } from "./components"
import { udp } from "./net"

export const eff_clients = createEffect(({ spawn, destroy }) => {
  const clients = new Map()

  udp.connections.subscribe(connection => {
    const entity = spawn(component(Player))
    clients.set(entity, connection)
    connection.closed.subscribe(() => {
      destroy(entity)
      clients.delete(entity)
    })
  })

  const send_u = (entity: Entity, data: unknown) =>
    clients.get(entity).send(data)
  const api = { send_u }

  return function eff_clients() {
    return api
  }
})
