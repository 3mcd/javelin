const { field, int8, float32 } = require("@javelin/pack")
const { encode, decode } = require("@msgpack/msgpack")
const { performance } = require("perf_hooks")
const { MessageBuilder, decodeMessage } = require("../dist/protocol_v2")

const schemaComponentBase = {
  _tid: field(int8),
}
const schemaPosition = {
  ...schemaComponentBase,
  x: field(float32),
  y: field(float32),
  z: field(float32),
}
const schemaVelocity = {
  ...schemaComponentBase,
  x: field(float32),
  y: field(float32),
  z: field(float32),
  avx: field(float32),
  avy: field(float32),
  avz: field(float32),
}
const schemaQuaternion = {
  ...schemaComponentBase,
  x: field(float32),
  y: field(float32),
  z: field(float32),
  w: field(float32),
}
const a = Math.pow(2, 53)

const position = () => ({ _tid: 1, x: a, y: a, z: a })
const velocity = () => ({ _tid: 2, x: a, y: a, z: a, avx: a, avy: a, avz: a })
const quaternion = () => ({ _tid: 3, x: a, y: a, z: a, w: a })

const schemas = new Map([
  [1, schemaPosition],
  [2, schemaVelocity],
  [3, schemaQuaternion],
])

function createMessageBuilder() {
  const messageBuilder = new MessageBuilder(schemas)
  messageBuilder.setTick(123)

  // 100 spawned entities
  for (let i = 0; i < 100; i++) {
    messageBuilder.spawn(i, [position(), velocity(), quaternion()])
  }

  // 75 attached components
  for (let i = 0; i < 25; i++) {
    messageBuilder.attach(i, [position(), velocity(), quaternion()])
  }

  // 300 changed entities
  for (let i = 0; i < 100; i++) {
    messageBuilder.update(i, [position(), velocity(), quaternion()])
  }

  // 75 detached components
  for (let i = 0; i < 25; i++) {
    messageBuilder.detach(i, [1, 2, 3])
  }

  // 100 destroyed entities
  for (let i = 0; i < 100; i++) {
    messageBuilder.destroy(i)
  }

  return messageBuilder
}

function createMessageJson() {
  const json = [1, {}, [], [], [], [], []]

  for (let i = 0; i < 100; i++) {
    json[2].push(i, position(), velocity(), quaternion())
  }

  for (let i = 0; i < 25; i++) {
    json[3].push(i, position(), velocity(), quaternion())
  }

  for (let i = 0; i < 100; i++) {
    json[4].push(i, position(), velocity(), quaternion())
  }

  for (let i = 0; i < 25; i++) {
    json[5].push(i, 1, 2, 3)
  }

  for (let i = 0; i < 100; i++) {
    json[6].push(i)
  }

  return json
}

const messageBuilder = createMessageBuilder()
const messageJson = createMessageJson()

const messageBuilderEncoded = createMessageBuilder().encode()
const messageMsgpackEncoded = encode(messageJson)
const messageJsonEncoded = JSON.stringify(messageJson)

const run = (task, n = 1000) => {
  const start = performance.now()
  for (let i = 0; i < n; i++) {
    task()
  }
  return performance.now() - start
}

/*
 * @javelin/protocol
 */

const encodeTime = run(() => {
  messageBuilder.encode()
})
const handlers = {
  onTick: () => {},
  onModel: () => {},
  onCreate: () => {},
  onAttach: () => {},
  onUpdate: () => {},
  onDetach: () => {},
  onDestroy: () => {},
}
const decodeTime = run(() => {
  decodeMessage(messageBuilderEncoded, schemas, handlers)
})

/*
 * @msgpack/msgpack
 */

const msgpackEncodeTime = run(() => {
  encode(messageJson)
})
const msgpackDecodeTime = run(() => {
  decode(messageMsgpackEncoded)
})

/*
 * JSON
 */

const jsonEncodeTime = run(() => {
  JSON.stringify(messageJson)
})
const jsonDecodeTime = run(() => {
  JSON.parse(messageJsonEncoded)
})

console.log("S=100, A=75, D=75, X=100")

console.log("encode (smaller is better)")
console.log("protocol", encodeTime / 1000)
console.log("msgpack", msgpackEncodeTime / 1000)
console.log("json", jsonEncodeTime / 1000)
console.log("")

console.log("decode (smaller is better)")
console.log("protocol", decodeTime / 1000)
console.log("msgpack", msgpackDecodeTime / 1000)
console.log("json", jsonDecodeTime / 1000)
console.log("")

console.log("size (smaller is better)")
console.log("protocol", messageBuilderEncoded.byteLength)
console.log("msgpack", messageMsgpackEncoded.byteLength)
console.log("json", Buffer.byteLength(messageJsonEncoded, "utf-8"))