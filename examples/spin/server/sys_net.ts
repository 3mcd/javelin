import { useInterval, World } from "@javelin/ecs"
import { encode } from "@javelin/net"
import { effClients } from "./eff_clients"
import { eff_message, getInitialMessage } from "./eff_message"
import { SEND_RATE } from "./env"
import { qryPlayers } from "./queries"

export const sysNet = (world: World) => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = effClients()
  const producer = eff_message(send)

  if (send) {
    const message = producer.take()
    for (const [entities, [players]] of qryPlayers) {
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
