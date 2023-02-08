import * as j from "@javelin/ecs"
import {clockSyncMessage} from "./clock_sync.js"
import {commandMessage} from "./commands.js"
import {interestMessage} from "./interest.js"
import {presenceMessage} from "./presence.js"
import {makeProtocol} from "./protocol.js"
import {snapshotMessage} from "./snapshot.js"

export const DEFAULT_MESSAGES = [
  clockSyncMessage,
  commandMessage,
  interestMessage,
  presenceMessage,
  snapshotMessage,
]

export let makeDefaultProtocol = (world: j.World) => {
  let protocol = makeProtocol(world)
  for (let i = 0; i < DEFAULT_MESSAGES.length; i++) {
    protocol.register(DEFAULT_MESSAGES[i], i)
  }
  return protocol
}
