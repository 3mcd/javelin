import {
  $flat,
  arrayOf,
  createModel,
  FieldExtract,
  initializeWithSchema,
  isField,
  isPrimitiveField,
  Schema,
} from "@javelin/core"
import { Component, component, registerSchema } from "@javelin/ecs"
import {
  encode,
  enhanceModel,
  float32,
  float64,
  ModelEnhanced,
  uint16,
  uint32,
  uint8,
} from "@javelin/pack"
import { ChangeSet, set } from "@javelin/track"
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
  array: arrayOf(arrayOf({ deep: float32 })),
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
  it("creates patch ops", () => {
    const entity = 0
    const changeset = initializeWithSchema(
      {} as FieldExtract<typeof ChangeSet>,
      ChangeSet,
    )
    const position = component(Position)
    const velocity = component(Velocity)
    const complex = component(Complex)
    const tracks: [
      Component,
      FieldExtract<typeof ChangeSet>,
      string,
      unknown,
    ][] = [
      [position, changeset, "x", 99],
      [position, changeset, "y", 100],
      [velocity, changeset, "x", 3.3333333],
      [velocity, changeset, "y", 1.1],
      [complex, changeset, "nested", { foo: 4 }],
      [complex, changeset, "array.0", [{ deep: 987 }]],
    ]
    tracks.forEach(args => set(...args))
    const op = patch(model, entity, changeset)
    // entity
    expect(op.data[0]).toBe(entity)
    expect(op.view[0]).toBe(uint32)
    // size
    expect(op.data[1]).toBe(changeset.size)
    expect(op.view[1]).toBe(uint8)
    let j = 2
    for (const prop in changeset.changes) {
      const schemaId = +prop
      const { fields, fieldCount, arrayCount } = changeset.changes[schemaId]
      const type = model[$flat][schemaId]
      expect(op.data[j]).toBe(schemaId)
      expect(op.view[j]).toBe(uint8)
      j++
      expect(op.data[j]).toBe(fieldCount)
      expect(op.view[j]).toBe(uint8)
      j++
      expect(op.data[j]).toBe(arrayCount)
      expect(op.view[j]).toBe(uint8)
      j++
      for (const prop in fields) {
        const {
          record: { field, traverse },
          value,
        } = fields[prop]
        // field
        expect(op.data[j]).toBe(field)
        j++
        // traverse length
        expect(op.data[j]).toBe(traverse.length)
        j++
        // traverse
        for (let k = 0; k < traverse.length; k++) {
          expect(op.data[j]).toBe(traverse[k])
          j++
        }
        const node = type[field]
        if (isField(node) && isPrimitiveField(node)) {
          // primitive fields
          expect(op.data[j]).toBe(value)
          j++
        } else {
          // complex fields
          const encoded = encode(value, node)
          expect(String(op.data[j])).toBe(String(encoded))
          expect(op.view[j]).toBe($buffer)
          j++
        }
      }
    }
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
