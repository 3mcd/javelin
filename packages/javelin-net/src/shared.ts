import {clockSyncMessage} from "./clock_sync.js"
import {commandMessage} from "./commands.js"
import {interestMessage} from "./interest.js"
import {presenceMessage} from "./presence.js"
import {snapshotInterestMessage} from "./snapshot.js"

export const DEFAULT_MESSAGES = [
  clockSyncMessage,
  commandMessage,
  interestMessage,
  presenceMessage,
  snapshotInterestMessage,
]
