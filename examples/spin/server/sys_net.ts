import { useInterval, World } from "@javelin/ecs"
import { encode } from "@javelin/net"
import { eff_clients } from "./eff_clients"
import { eff_message, getInitialMessage } from "./eff_message"
import { SEND_RATE } from "./env"
import { qry_players } from "./queries"

export const sys_net = (world: World) => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = eff_clients()
  const producer = eff_message(send)

  if (send) {
    const message = producer.take()
    for (const [entities, [players]] of qry_players) {
      for (let i = 0; i < entities.length; i++) {
        const p = players[i]
        let packet
        if (p.initialized) {
          packet = message
        } else {
          packet = getInitialMessage(world)
          p.initialized = true
        }
        if (packet) {
          clients.send_u(entities[i], encode(packet))
        }
      }
    }
  }
}
