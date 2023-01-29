import {World} from "@javelin/ecs"
import {perf} from "@javelin/perf"
import {makeProtocol} from "./protocol.js"
import {ReadStream, WriteStream} from "./stream.js"

let messageType = {
  encode(writeStream: WriteStream, _: World, n: number) {
    writeStream.writeU8(n)
  },
  decode(readStream: ReadStream) {
    readStream.readU8()
  },
}
let protocol = makeProtocol().addMessageType(messageType)

perf("encode", () => {
  let world = new World()
  let writeStream = new WriteStream()
  return () => {
    protocol.encode(world, writeStream, messageType, 0)
  }
})

perf("decode", () => {
  let world = new World()
  let writeStream = new WriteStream()
  protocol.encode(world, writeStream, messageType, 0)
  let writeStreamBytes = writeStream.bytes()
  let readStream = new ReadStream(writeStreamBytes)
  return () => {
    protocol.decode(world, readStream)
  }
})
