import { Connection } from "@web-udp/client"
import { ConnectionType } from "../common/types"

export type Client = {
  sessionId: string
  unreliable?: Connection
  reliable?: Connection
}

export type ConnectionMetadata = {
  sessionId: string
  connectionType: ConnectionType
}
