import {value} from "@javelin/ecs"
import {Maybe} from "@javelin/lib"

export let NetworkTransport = value<NetworkTransport>()

export interface NetworkTransport {
  send(message: Uint8Array, messageType: number): void
  recv(): Maybe<Uint8Array>
}
