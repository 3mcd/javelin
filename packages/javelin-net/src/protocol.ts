import * as j from "@javelin/ecs"
import {assert, exists, expect} from "@javelin/lib"
import {ReadStream, WriteStream} from "./structs/stream.js"

type Encode<E extends unknown[]> = (
  stream: WriteStream,
  world: j.World,
  ...args: E
) => void
type Decode<D> = (stream: ReadStream, world: j.World, client: j.Entity) => D

type EncodeOpt<E extends unknown[]> = {encode: Encode<E>}
type DecodeOpt<D> = {decode: Decode<D>}
type EncodeApi<E extends unknown[]> = (stream: WriteStream, ...args: E) => void

export type Message<E extends unknown[] = unknown[], D = unknown> =
  | EncodeOpt<E>
  | DecodeOpt<D>
  | (EncodeOpt<E> & DecodeOpt<D>)

type DecodeIteratee = <D>(messageType: Message<unknown[], D>, value: D) => void

export type Protocol = {
  encoder<E extends unknown[]>(message: Message<E>): EncodeApi<E>
  decode(stream: ReadStream, iteratee: DecodeIteratee, client: j.Entity): void
  register(message: Message<any[], unknown>, messageId: number): void
}

let noop = () => {}

const ERR_UNEXPECTED_MESSAGE = "invalid message type"
const ERR_RESERVED_MESSAGE_ID = "message id is already taken"
const ERR_EXPECTED_ENCODER = "missing message encoder"
const ERR_EXPECTED_DECODER = "missing message decoder"

let compileEncoder = (messageId: number, encode: Function, world: j.World) => {
  let fArgsLength = encode.length - 2
  let fArgs = ""
  for (let i = 0; i < fArgsLength; i++) {
    fArgs += `a${i},`
  }
  let body = `return(s,${fArgs})=>{`
  body += `s.grow(1);`
  body += `s.writeU8(${messageId});`
  body += `let o=s.offset;`
  body += `f(s,w,${fArgs});`
  body += `if(s.offset-o===0)s.shrink(1);`
  body += "}"
  return Function("f", "w", body)(encode, world)
}

export let makeProtocol = (world: j.World): Protocol => {
  let encoders = new Map<Message, EncodeApi<unknown[]>>()
  let decoders = [] as Decode<unknown>[]
  let messages = [] as Message[]
  return {
    encoder(message: Message) {
      return expect(encoders.get(message), ERR_EXPECTED_ENCODER)
    },
    decode(stream: ReadStream, iteratee: DecodeIteratee, client: j.Entity) {
      while (stream.offset < stream.length) {
        let messageId = stream.readU8()
        let message = expect(messages[messageId], ERR_UNEXPECTED_MESSAGE)
        let decode = expect(decoders[messageId], ERR_EXPECTED_DECODER)
        iteratee(message, decode(stream, world, client))
      }
    },
    register(message: Message, messageId: number) {
      assert(!exists(messages[messageId]), ERR_RESERVED_MESSAGE_ID)
      let encode =
        "encode" in message
          ? compileEncoder(messageId, message.encode, world)
          : noop
      let decode = "decode" in message ? message.decode : noop
      encoders.set(message, encode)
      decoders[messageId] = decode
      messages[messageId] = message
    },
  }
}

export let makeMessage = <E extends unknown[], D>(
  message: Message<E, D>,
): Message<E, D> => message
