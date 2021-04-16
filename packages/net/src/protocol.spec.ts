import { Component, Entity } from "@javelin/ecs"
import { arrayOf, createModel, Model, Schema } from "@javelin/model"
import { float64, uint32, uint8 } from "@javelin/pack"
import {
  attach,
  createMessage,
  decodeMessage,
  DecodeMessageHandlers,
  destroy,
  detach,
  encodeMessage,
  patch,
  spawn,
  tick,
  update,
} from "./protocol"

type EntityComponentsPair = [Entity, Component[]]
type EntityComponentIdsPair = [Entity, number[]]

describe("protocol", () => {
  const baseSchema = {
    __type__: uint8,
    x: float64,
  }

  let baseHandlers: DecodeMessageHandlers

  beforeEach(() => {
    baseHandlers = {
      onModel: jest.fn(),
      onTick: jest.fn(),
      onCreate: jest.fn(),
      onAttach: jest.fn(),
      onUpdate: jest.fn(),
      onDetach: jest.fn(),
      onDestroy: jest.fn(),
      onPatch: jest.fn(),
    }
  })

  it("sanity check", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const message = createMessage(model)

    tick(message, 999)
    spawn(message, 1, [{ __type__: 1, x: 9 }])
    spawn(message, 2, [{ __type__: 1, x: 9 }])
    attach(message, 3, { __type__: 1, x: 9 })
    update(message, 3, { __type__: 1, x: 9 })
    patch(message, 3, 1, {
      arrays: [],
      fields: { x: { field: 1, value: 10 } },
      fieldsCount: 1,
    })
    patch(message, 3, 1, {
      arrays: [],
      fields: { x: { field: 1, value: 11 } },
      fieldsCount: 1,
    })
    detach(message, 4, 1, 2, 3)
    destroy(message, 5)
    destroy(message, 6)

    expect(() => {
      decodeMessage(encodeMessage(message), baseHandlers, model)
      decodeMessage(encodeMessage(message, true), baseHandlers)
      decodeMessage(encodeMessage(message, true), baseHandlers, model)
    }).not.toThrow()

    expect(() => {
      decodeMessage(encodeMessage(message), baseHandlers)
    }).toThrow()
  })

  it("deserializes model", () => {
    const model = createModel(
      new Map([
        [
          0,
          {
            __type__: uint8,
            arr_schema: arrayOf({
              y: float64,
            }),
            arr_simple: arrayOf(uint8),
            nested: { a: uint32 },
            x: float64,
          } as Schema,
        ],
        [
          1,
          {
            __type__: uint8,
          } as Schema,
        ],
      ]),
    )
    const message = createMessage(model)

    decodeMessage(encodeMessage(message, true), baseHandlers)

    const snapshot = (model: Model) => JSON.stringify(model)
    const emitted = (baseHandlers.onModel as jest.Mock).mock.calls[0][0]

    expect(snapshot(emitted)).toEqual(snapshot(model))
  })

  it("deserializes tick", () => {
    const model = createModel(new Map<number, Schema>())
    const message = createMessage(model)

    tick(message, 7)
    decodeMessage(encodeMessage(message), baseHandlers, model)
    expect(baseHandlers.onTick).toHaveBeenCalledWith(7)
  })

  it("deserializes spawned", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const message = createMessage(model)
    const spawns: EntityComponentsPair[] = [[7, [{ __type__: 1, x: 888 }]]]
    const results: EntityComponentsPair[] = []
    const handlers = {
      ...baseHandlers,
      onCreate: (...args: EntityComponentsPair) => results.push(args),
    }

    for (let i = 0; i < spawns.length; i++) {
      spawn(message, ...spawns[i])
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(spawns)
  })

  it("deserializes attached", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const message = createMessage(model)
    const attaches: EntityComponentsPair[] = [[7, [{ __type__: 1, x: 888 }]]]
    const results: EntityComponentsPair[] = []
    const handlers = {
      ...baseHandlers,
      onAttach: (...args: EntityComponentsPair) => results.push(args),
    }

    for (let i = 0; i < attaches.length; i++) {
      const [entity, [component]] = attaches[i]
      attach(message, entity, component)
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(attaches)
  })

  it("deserializes updated", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const message = createMessage(model)
    const updates: EntityComponentsPair[] = [[7, [{ __type__: 1, x: 888 }]]]
    const results: EntityComponentsPair[] = []
    const handlers = {
      ...baseHandlers,
      onUpdate: (...args: EntityComponentsPair) => results.push(args),
    }

    for (let i = 0; i < updates.length; i++) {
      const [entity, [component]] = updates[i]
      update(message, entity, component)
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(updates)
  })

  it("deserializes detached", () => {
    const model = createModel(new Map())
    const message = createMessage(model)
    const detaches: EntityComponentIdsPair[] = [[5, [1, 2, 4]]]
    const results: EntityComponentIdsPair[] = []
    const handlers = {
      ...baseHandlers,
      onDetach: (...args: EntityComponentIdsPair) => results.push(args),
    }

    for (let i = 0; i < detaches.length; i++) {
      const [entity, componentTypeIds] = detaches[i]
      detach(message, entity, ...componentTypeIds)
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(detaches)
  })

  it("deserializes destroyed", () => {
    const model = createModel(new Map())
    const message = createMessage(model)
    const destroys: Entity[] = [1, 2, 3]
    const results: Entity[] = []
    const handlers = {
      ...baseHandlers,
      onDestroy: (entity: Entity) => results.push(entity),
    }

    for (let i = 0; i < destroys.length; i++) {
      destroy(message, destroys[i])
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(destroys)
  })
})
