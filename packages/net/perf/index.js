const { field, int8 } = require("@javelin/pack")
const { performance } = require("perf_hooks")
const { MessageBuilder, decodeMessage } = require("../dist/protocol_v2")

const schemaComponentBase = { _tid: field(int8), _cst: field(int8) }
const schemaA = { ...schemaComponentBase }
const schemaB = { ...schemaComponentBase }
const schemaC = { ...schemaComponentBase }

const model = new Map([
  [1, schemaA],
  [2, schemaB],
  [3, schemaC],
])

function createMessage() {
  const builder = new MessageBuilder(model)

  builder.setTick(123)

  // 100 spawned entities
  for (let i = 0; i < 100; i++) {
    builder.spawn(i, [
      { _tid: 1, _cst: 2 },
      { _tid: 2, _cst: 2 },
      { _tid: 3, _cst: 2 },
    ])
  }

  // 75 attached components
  for (let i = 0; i < 25; i++) {
    builder.attach(i, [
      { _tid: 1, _cst: 2 },
      { _tid: 2, _cst: 2 },
      { _tid: 3, _cst: 2 },
    ])
  }

  // 75 detached components
  for (let i = 0; i < 25; i++) {
    builder.detach(i, [1, 2, 3])
  }

  // 100 destroyed entities
  for (let i = 0; i < 100; i++) {
    builder.destroy(i)
  }

  return builder.encode()
}

function createMessageJson() {
  const json = [1, [], [], [], []]

  for (let i = 0; i < 100; i++) {
    json[1].push(
      i,
      { _tid: 1, _cst: 2 },
      { _tid: 2, _cst: 2 },
      { _tid: 3, _cst: 2 },
    )
  }

  for (let i = 0; i < 75; i++) {
    json[2].push(
      i,
      { _tid: 1, _cst: 2 },
      { _tid: 2, _cst: 2 },
      { _tid: 3, _cst: 2 },
    )
  }

  for (let i = 0; i < 75; i++) {
    json[3].push(i, 1, 2, 3)
  }

  for (let i = 0; i < 100; i++) {
    json[4].push(i)
  }

  return json
}

const encodeStart = performance.now()

for (let i = 0; i < 1000; i++) {
  createMessage()
}

const encodeTime = performance.now() - encodeStart

const encoded = createMessage()

const decodeStart = performance.now()

for (let i = 0; i < 1000; i++) {
  decodeMessage(
    encoded,
    model,
    () => {},
    () => {},
    () => {},
    () => {},
    () => {},
  )
}

const decodeTime = performance.now() - decodeStart

const jsonEncodeStart = performance.now()

for (let i = 0; i < 1000; i++) {
  JSON.stringify(createMessageJson())
}

const jsonEncodeTime = performance.now() - jsonEncodeStart

const jsonEncoded = JSON.stringify(createMessageJson())

const jsonDecodeStart = performance.now()

for (let i = 0; i < 1000; i++) {
  JSON.parse(jsonEncoded)
}

const jsonDecodeTime = performance.now() - jsonDecodeStart

console.log("S=100, A=75, D=75, X=100")

console.log("encode (smaller is better)")
console.log("protocol", encodeTime / 1000)
console.log("json", jsonEncodeTime / 1000)
console.log("")

console.log("decode (smaller is better)")
console.log("protocol", decodeTime / 1000)
console.log("json", jsonDecodeTime / 1000)
console.log("")

console.log("size (smaller is better)")
console.log("protocol", encoded.byteLength)
console.log("json", Buffer.byteLength(jsonEncoded, "utf-8"))
