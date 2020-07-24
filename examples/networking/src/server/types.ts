import { Connection } from "@web-udp/client"
import { ConnectionType } from "../common/types"

export type Client = {
  sessionId: string
  unreliable?: Connection
  reliable?: Connection
  initialized: boolean
}

export type ConnectionMetadata = {
  sessionId: string
  connectionType: ConnectionType
}
