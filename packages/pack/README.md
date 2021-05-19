# `@javelin/pack`

This algorithm has been written a million times. So why maintain our own?

1. Keep Javelin dependency free
2. Limit number of features to stay small and fast

## Features

- Easy to integrate with your existing ArrayBuffer-based protocol.
- Includes `boolean`, `string8`, `string16`, `uint8`, `uint16`, `uint32`, `int8`, `int16`, `int32`, `float32`, `float64`.
- Deeply nested objects, e.g. `{ stats: { strength: uint16 } }`
- Deeply nested arrays, e.g. `{ order: arrayOf(arrayOf({ name: string16 })) }`

## Example

```ts
import {
  arrayOf,
  createModel,
  decode,
  encode,
  string8,
  uint8,
} from "@javelin/pack"

const person = {
  name: string8,
  age: uint8,
}

const model = createModel({
  ...person,
  children: arrayOf(person),
})

const data = {
  name: "Ben",
  age: 64,
  children: [
    { name: "Chantel", age: 23 },
    { name: "Alyssa", age: 21 },
  ],
}

const encoded = encode(data, model) // <08 00 28 e7 ...>
const decoded = decode(encoded, model) // { name: "Ben", ... }
```

## Unsupported

- Cycles (e.g. `person.children = arrayOf(person)`)

## Performance

`yarn perf` will run performance tests. Example `perf` output:

```
encode @60hz (bigger is better)
pack    9172.586162591406
msgpack 8341.438421156548
json    8812.036962151693

decode @60hz (bigger is better)
pack    13507.305450145765
msgpack 12591.815349590674
json    8160.358308042964

size (smaller is better)
pack    47
msgpack 117
json    166
```
