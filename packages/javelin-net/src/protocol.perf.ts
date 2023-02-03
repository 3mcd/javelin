import * as j from "@javelin/ecs"
import {perf} from "@javelin/perf"
import {makeProtocol, makeMessage} from "./protocol.js"
import {WriteStream, ReadStream} from "./structs/stream.js"

let fixture = () => {
  let world = new j.World()
  let protocol = makeProtocol(world)
  let message = makeMessage(
    (w, _, a: number, b: number) => {
      w.grow(2)
      w.writeU8(a)
      w.writeU8(b)
    },
    (w, _) => w.readU8() + w.readU8(),
  )
  protocol.register(message, 0)
  return {protocol, message}
}

perf("encode", () => {
  let {protocol, message} = fixture()
  let encode = protocol.encoder(message)
  let w = new WriteStream()
  return () => {
    for (let i = 0; i < 1_000; i++) {
      encode(w, 99, 100)
    }
  }
})

perf("decode", () => {
  let {protocol, message} = fixture()
  let encode = protocol.encoder(message)
  let w = new WriteStream()
  for (let i = 0; i < 1_000; i++) {
    encode(w, 99, 100)
  }
  let r = new ReadStream(w.bytes())
  return () => {
    protocol.decode(r, () => {}, 0 as j.Entity)
  }
})
