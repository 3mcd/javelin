import {
  $flat,
  arrayOf,
  assert,
  CollatedNode,
  createModel,
  FieldExtract,
  initializeWithSchema,
  isField,
  isPrimitiveField,
  Schema,
} from "@javelin/core"
import { Component, component, registerSchema } from "@javelin/ecs"
import {
  ByteView,
  encode,
  enhanceModel,
  float32,
  float64,
  ModelEnhanced,
  uint16,
  uint32,
  uint8,
} from "@javelin/pack"
import { ChangeSet, MutArrayMethod, push, set } from "@javelin/track"
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
  it.only("creates patch ops", () => {
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
    const pushes: [
      Component,
      FieldExtract<typeof ChangeSet>,
      string,
      unknown,
    ][] = [[complex, changeset, "array", [{ deep: 123 }]]]
    tracks.forEach(args => set(...args))
    pushes.forEach(args => push(...args))
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
      const { fields, fieldCount, arrayCount, array } =
        changeset.changes[schemaId]
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
        for (let i = 0; i < traverse.length; i++) {
          expect(op.data[j]).toBe(traverse[i])
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
      for (let i = 0; i < arrayCount; i++) {
        const {
          method,
          values,
          start,
          deleteCount,
          record: { field, traverse },
        } = array[i]
        // method
        expect(op.data[j]).toBe(method)
        j++
        // field
        expect(op.data[j]).toBe(field)
        j++
        // traverse length
        expect(op.data[j]).toBe(traverse.length)
        j++
        // traverse
        for (let i = 0; i < traverse.length; i++) {
          expect(op.data[j]).toBe(traverse[i])
          j++
        }
        expect(op.data[j]).toBe(values.length)
        j++
        if (method === MutArrayMethod.Pop || method === MutArrayMethod.Shift) {
          continue
        }
        const node = type[field]
        // values
        for (let i = 0; i < values.length; i++) {
          const value = values[i]
          assert("element" in node)
          if (isField(node) && isPrimitiveField(node)) {
            // primitive fields
            expect(op.data[j]).toBe(value)
            j++
          } else {
            // complex fields
            const encoded = encode(
              value,
              node.element as CollatedNode<ByteView>,
            )
            expect(String(op.data[j])).toBe(String(encoded))
            expect(op.view[j]).toBe($buffer)
            j++
          }
        }
        if (
          method === MutArrayMethod.Push ||
          method === MutArrayMethod.Unshift
        ) {
          continue
        }
        expect(op.data[j]).toBe(start)
        j++
        expect(op.data[j]).toBe(deleteCount)
        j++
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
