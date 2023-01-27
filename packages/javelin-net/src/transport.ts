import {exists, Maybe} from "@javelin/lib"

export interface Transport {
  push(message: Uint8Array, reliable: boolean): void
  pull(): Maybe<Uint8Array>
}

export class WebsocketTransport implements Transport {
  #inbox
  #socket

  constructor(socket: WebSocket) {
    this.#inbox = [] as Uint8Array[]
    this.#socket = socket
    this.#socket.binaryType = "arraybuffer"
    this.#socket.addEventListener("message", message => {
      this.#inbox.unshift(message.data)
    })
  }

  push(message: Uint8Array) {
    this.#socket.send(message)
  }

  pull() {
    let message = this.#inbox.pop()
    if (exists(message)) {
      return new Uint8Array(message)
    }
  }
}
