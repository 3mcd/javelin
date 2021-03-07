const { serialize, deserialize, uint8, string8, field } = require("../dist/cjs")
const { encode, decode } = require("@msgpack/msgpack")
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

const javelinPackSerialized = serialize(player, schema)

const javelinPackSerializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  serialize(player, schema)
}
const javelinPackSerializeTime = performance.now() - javelinPackSerializeStart

const javelinPackDeserializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  deserialize(javelinPackSerialized, schema)
}
const javelinPackDeserializeTime =
  performance.now() - javelinPackDeserializeStart

// @msgpack/msgpack

const msgpackSerialized = encode(player)

const msgpackSerializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  encode(player)
}
const msgpackSerializeTime = performance.now() - msgpackSerializeStart

const msgpackDeserializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  decode(msgpackSerialized)
}
const msgpackDeserializeTime = performance.now() - msgpackDeserializeStart

// JSON

const jsonSerialized = JSON.stringify(player)

const jsonSerializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  JSON.stringify(player)
}
const jsonSerializeTime = performance.now() - jsonSerializeStart

const jsonDeserializeStart = performance.now()
for (let i = 0; i < COUNT; i++) {
  JSON.parse(jsonSerialized)
}
const jsonDeserializeTime = performance.now() - jsonDeserializeStart

console.log("serialize @60hz (bigger is better)")
console.log("pack   ", 1000 / 60 / (javelinPackSerializeTime / COUNT))
console.log("msgpack", 1000 / 60 / (msgpackSerializeTime / COUNT))
console.log("json   ", 1000 / 60 / (jsonSerializeTime / COUNT))

console.log("deserialize @60hz (bigger is better)")
console.log("pack   ", 1000 / 60 / (javelinPackDeserializeTime / COUNT))
console.log("msgpack", 1000 / 60 / (msgpackDeserializeTime / COUNT))
console.log("json   ", 1000 / 60 / (jsonDeserializeTime / COUNT))

console.log("size (smaller is better)")
console.log("pack   ", javelinPackSerialized.byteLength)
console.log("msgpack", encode(player).byteLength)
console.log("json   ", Buffer.byteLength(jsonSerialized, "utf8"))
