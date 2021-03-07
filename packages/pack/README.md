# `@javelin/binary`

This algorithm has been written a million times. So why maintain our own?

1) Keep Javelin dependency free.
2) Limit number of features to stay small and fast.

```ts
import { field, string8, uint8, serialize, deserialize } from "@javelin/pack"

const schema = {
  name: field(string8),
  age: field(uint8),
}

const data = {
  name: "Ben",
  age: 64
}

const encoded = serialize(data, schema) // <08 00 28 e7 ...>
const decoded = deserialize(encoded, schema) // { name: "Ben", ... }
```