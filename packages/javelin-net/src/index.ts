export {clientPlugin} from "./client/client_plugin.js"
export {ServerTransport} from "./client/client_resources.js"
export {NetworkId} from "./network_id.js"
export {NetworkConfig} from "./network_resources.js"
export {NetworkTransport} from "./network_transport.js"
export {Client, serverPlugin} from "./server/server_plugin.js"
import {Type} from "@javelin/ecs"
import {AwarenessImpl, Interest} from "./server/awareness.js"
import {WebsocketTransport} from "./transports/websocket_transport.js"

export let awareness = () => new AwarenessImpl()
export let interest = (type: Type) => new Interest(type)
export let websocketTransport = (websocket: WebSocket) =>
  new WebsocketTransport(websocket)
