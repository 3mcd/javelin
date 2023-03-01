import * as j from "@javelin/ecs"
import {suite, test, expect} from "vitest"
import {makeNetworkProtocol, makeMessage} from "./protocol.js"
import {ReadStream, WriteStream} from "./structs/stream.js"

suite("NetworkProtocol2", () => {
  test("test", () => {
    let world = new j.World()
    let protocol = makeNetworkProtocol(world)
    let message = makeMessage({
      encode(stream, _, a: number, b: number) {
        stream.grow(8)
        stream.writeU32(a)
        stream.writeU32(b)
      },
      decode(stream) {
        return [stream.readU32(), stream.readU32()]
      },
    })
    protocol.register(message, 99)
    let encode = protocol.encoder(message)
    let stream = new WriteStream()
    encode(stream, 1, 2)
    protocol.decode(
      new ReadStream(stream.bytes()),
      (m, p) => {
        expect(m).toBe(message)
        expect(p).toEqual([1, 2])
      },
      0 as j.Entity,
    )
  })
})
