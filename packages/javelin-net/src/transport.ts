import {exists, Maybe} from "@javelin/lib"

export interface Transport {
  push(message: Uint8Array, reliable: boolean): void
  pull(): Maybe<Uint8Array>
}

export class WebsocketTransport implements Transport {
  #inbox
  #outbox
  #socket

  constructor(socket: WebSocket) {
    this.#inbox = [] as Uint8Array[]
    this.#outbox = [] as Uint8Array[]
    this.#socket = socket
    this.#socket.binaryType = "arraybuffer"
    this.#socket.addEventListener("message", message => {
      this.#inbox.unshift(message.data)
    })
  }

  push(message: Uint8Array) {
    if (this.#socket.readyState !== this.#socket.OPEN) {
      this.#outbox.unshift(message)
      return
    }
    if (this.#outbox.length > 0) {
      let message: Maybe<Uint8Array>
      while (exists((message = this.#outbox.pop()))) {
        this.#socket.send(message)
      }
    }
    this.#socket.send(message)
  }

  pull() {
    let message = this.#inbox.pop()
    if (exists(message)) {
      return new Uint8Array(message)
    }
  }
}
