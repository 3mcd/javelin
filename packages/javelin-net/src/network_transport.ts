import {component} from "@javelin/ecs"
import {Maybe} from "@javelin/lib"

export let NetworkTransport = component<NetworkTransport>()

export interface NetworkTransport {
  send(message: Uint8Array, messageType: number): void
  recv(): Maybe<Uint8Array>
}
