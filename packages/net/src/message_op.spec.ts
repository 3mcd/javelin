import { arrayOf, createModel, isSimple, Schema } from "@javelin/core"
import {
  $changes,
  $touched,
  component,
  observe,
  registerSchema,
  useMonitor,
} from "@javelin/ecs"
import {
  encode,
  decode,
  enhanceModel,
  float32,
  float64,
  ModelEnhanced,
  uint16,
  uint32,
  uint8,
} from "@javelin/pack"
import {
  $buffer,
  attach,
  destroy,
  detach,
  patch,
  snapshot,
  update,
} from "./message_op"

const Position = { x: float64, y: float64 }
const Velocity = { x: float64, y: float64 }
const Rotation = { a: float64 }
const Complex = {
  nested: { foo: uint16 },
  array: arrayOf(arrayOf({ deep: uint8 })),
}

registerSchema(Position, 0)
registerSchema(Velocity, 1)
registerSchema(Rotation, 2)
registerSchema(Complex, 3)

function runSnapshotOpTest(
  snapshotOpFactory: typeof snapshot,
  model: ModelEnhanced,
) {
  const entity = 0
  const components = [
    component(Position),
    component(Velocity),
    component(Rotation),
  ]
  const componentsEncoded = components.map(c => encode(c, model[c.__type__]))
  const op = snapshotOpFactory(model, entity, components)
  expect(op.data[0]).toBe(entity)
  expect(op.data[1]).toBe(components.length)
  let i = 2
  let j = 0
  while (i < op.data.length) {
    expect(op.data[i]).toBe(components[j].__type__)
    expect(op.view[i]).toBe(uint8)
    i++
    expect(String(op.data[i])).toBe(String(componentsEncoded[j]))
    expect(op.view[i]).toBe($buffer)
    i++
    j++
  }
  expect(op.byteLength).toBe(
    uint32.byteLength + // entity
      uint8.byteLength + // count
      components.reduce(
        (a, c, i) =>
          a +
          uint8.byteLength + // schemaId
          componentsEncoded[i].byteLength, // encoded
        0,
      ),
  )
}

describe("message_op", () => {
  let model: ModelEnhanced
  beforeEach(() => {
    const config = new Map<number, Schema>([
      [0, Position],
      [1, Velocity],
      [2, Rotation],
      [3, Complex],
    ])
    model = enhanceModel(createModel(config))
  })
  it("creates attach ops", () => runSnapshotOpTest(attach, model))
  it("creates update ops", () => runSnapshotOpTest(update, model))
  it.only("creates patch ops", () => {
    const e = 0
    const c = component(Complex)
    const o = observe(c)
    o.nested.foo = 2
    o.array.push([{ deep: 0 }])
    o.array[0][0].deep = 120
    console.log(encode(c, model[c.__type__]), model[c.__type__])
    const op = patch(model, e, c)
    console.log(op)
  })
  it("creates detach ops", () => {
    const entity = 0
    const schemaIds = [0, 1, 2]
    const op = detach(entity, schemaIds)
    expect(op.data[0]).toBe(entity)
    expect(op.view[0]).toBe(uint32)
    expect(op.data[1]).toBe(schemaIds.length)
    expect(op.view[1]).toBe(uint8)
    for (let i = 0; i < schemaIds.length; i++) {
      expect(op.data[i + 2]).toBe(schemaIds[i])
      expect(op.view[i + 2]).toBe(uint8)
    }
  })
  it("creates destroy ops", () => {
    const entity = 0
    const op = destroy(entity)
    expect(op.data[0]).toBe(entity)
    expect(op.view[0]).toBe(uint32)
  })
})
