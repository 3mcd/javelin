const { encode, decode, uint8, string8, field } = require("../dist/cjs")
const msgpack = require("@msgpack/msgpack")
const { performance } = require("perf_hooks")
const player = {
  name: "Geralt",
  inventory: {
    order: [9, 1, 3, 6, 4, 8, 5, 2],
    items: [
      {
        name: "Sword",
        weight: 10,
        attributes: [
          { name: "damage", value: 4 },
          { name: "speed", value: 2 },
        ],
      },
    ],
  },
}
const schema = {
  name: field({
    type: string8,
    length: 6,
  }),
  inventory: {
    order: [field(uint8)],
    items: [
      {
        name: field({
          type: string8,
          length: 6,
        }),
        weight: field(uint8),
        attributes: [
          {
            name: field({
              type: string8,
              length: 6,
            }),
            value: field({
              type: uint8,
            }),
          },
        ],
      },
    ],
  },
}

const COUNT = 1000000

// @javelin/pack

const javelinPackEncoded = encode(player, schema)

const javelinPackEncodeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  encode(player, schema)
}
const javelinPackEncodeTime = performance.now() - javelinPackEncodeStart

const javelinPackDeserializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  decode(javelinPackEncoded, schema)
}
const javelinPackDeserializeTime =
  performance.now() - javelinPackDeserializeStart

// @msgpack/msgpack

const msgpackEncoded = msgpack.encode(player)

const msgpackEncodeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  msgpack.encode(player)
}
const msgpackEncodeTime = performance.now() - msgpackEncodeStart

const msgpackDeserializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  msgpack.decode(msgpackEncoded)
}
const msgpackDeserializeTime = performance.now() - msgpackDeserializeStart

// JSON

const jsonEncoded = JSON.stringify(player)

const jsonEncodeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  JSON.stringify(player)
}
const jsonEncodeTime = performance.now() - jsonEncodeStart

const jsonDeserializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  JSON.parse(jsonEncoded)
}
const jsonDeserializeTime = performance.now() - jsonDeserializeStart

const tick = 1000 / 60

console.log("encode @60hz (bigger is better)")
console.log("pack   ", tick / (javelinPackEncodeTime / COUNT))
console.log("msgpack", tick / (msgpackEncodeTime / COUNT))
console.log("json   ", tick / (jsonEncodeTime / COUNT))

console.log("")

console.log("decode @60hz (bigger is better)")
console.log("pack   ", tick / (javelinPackDeserializeTime / COUNT))
console.log("msgpack", tick / (msgpackDeserializeTime / COUNT))
console.log("json   ", tick / (jsonDeserializeTime / COUNT))

console.log("")

console.log("size (smaller is better)")
console.log("pack   ", javelinPackEncoded.byteLength)
console.log("msgpack", msgpackEncoded.byteLength)
console.log("json   ", Buffer.byteLength(jsonEncoded, "utf8"))
