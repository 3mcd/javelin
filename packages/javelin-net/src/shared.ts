import {clockSyncMessage} from "./clock_sync.js"
import {commandMessage} from "./commands.js"
import {interestMessage} from "./interest.js"
import {presenceMessage} from "./presence.js"
import {snapshotMessage} from "./snapshot.js"

export const DEFAULT_MESSAGES = [
  clockSyncMessage,
  commandMessage,
  interestMessage,
  presenceMessage,
  snapshotMessage,
]
