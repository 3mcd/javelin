import {NetworkTransport} from "../network_transport.js"

export class WebsocketTransport implements NetworkTransport {
  #websocket: WebSocket
  #recv_queue: Uint8Array[] = []

  constructor(websocket: WebSocket) {
    this.#websocket = websocket
    this.#websocket.binaryType = "arraybuffer"
    this.#websocket.addEventListener("message", event => {
      this.#recv_queue.push(new Uint8Array(event.data))
    })
  }

  send(message: Uint8Array) {
    this.#websocket.send(message)
  }

  recv(): Uint8Array | undefined {
    return this.#recv_queue.shift()
  }
}
