import { Component, component } from "@javelin/ecs"
import {
  createModel,
  initialize,
  InstanceOfSchema,
  Model,
  Schema,
} from "@javelin/core"
import { encode, float64, uint16, uint32, uint8 } from "@javelin/pack"
import { ChangeSet, set } from "@javelin/track"
import {
  $buffer,
  attach,
  destroy,
  detach,
  patch,
  snapshot,
  spawn,
  update,
} from "./message_op"

const Position = { x: float64, y: float64 }
const Velocity = { x: float64, y: float64 }
const Rotation = { a: float64 }

function runSnapshotOpTest(snapshotOpFactory: typeof snapshot, model: Model) {
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
    expect(op.data[i]).toBe(componentsEncoded[j].byteLength)
    expect(op.view[i]).toBe(uint16)
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
          uint16.byteLength + // length
          componentsEncoded[i].byteLength, // encoded
        0,
      ),
  )
}

describe("message_op", () => {
  let model: Model
  beforeEach(() => {
    const config = new Map<number, Schema>([
      [0, Position],
      [1, Velocity],
      [2, Rotation],
    ])
    model = createModel(config)
  })
  it("creates spawn ops", () => runSnapshotOpTest(spawn, model))
  it("creates attach ops", () => runSnapshotOpTest(attach, model))
  it("creates update ops", () => runSnapshotOpTest(update, model))
  it("creates patch ops", () => {
    const entity = 0
    const changeset = initialize(
      {} as InstanceOfSchema<typeof ChangeSet>,
      ChangeSet,
    )
    const position = component(Position)
    const velocity = component(Velocity)
    const tracks: [
      Component,
      InstanceOfSchema<typeof ChangeSet>,
      string,
      unknown,
    ][] = [
      [position, changeset, "x", 99],
      [position, changeset, "y", 100],
      [velocity, changeset, "x", 3.3333333],
      [velocity, changeset, "y", 1.1],
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
        // value
        expect(op.data[j]).toBe(value)
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
