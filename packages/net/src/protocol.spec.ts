import { Entity, EntitySnapshot, setModel } from "@javelin/ecs"
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
    const message = createMessage()

    setModel(model)

    tick(message, 999)
    spawn(message, 1, [{ __type__: 1, x: 9 }])
    spawn(message, 2, [{ __type__: 1, x: 9 }])
    attach(message, 3, [{ __type__: 1, x: 9 }])
    update(message, 3, [{ __type__: 1, x: 9 }])
    patch(message, 3, 1, {
      array: [],
      arrayCount: 0,
      fields: {
        x: {
          value: 10,
          record: { field: 1, path: "x", split: ["x"], traverse: [] },
          noop: false,
        },
      },
      fieldCount: 1,
    })
    patch(message, 3, 1, {
      array: [],
      arrayCount: 0,
      fields: {
        x: {
          value: 11,
          record: { field: 1, path: "x", split: ["x"], traverse: [] },
          noop: false,
        },
      },
      fieldCount: 1,
    })
    detach(message, 4, [
      { __type__: 2, x: 9 },
      { __type__: 3, x: 9 },
    ])
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
    const message = createMessage()

    setModel(model)

    decodeMessage(encodeMessage(message, true), baseHandlers)

    const snapshot = (model: Model) => JSON.stringify(model)
    const emitted = (baseHandlers.onModel as jest.Mock).mock.calls[0][0]

    expect(snapshot(emitted)).toEqual(snapshot(model))
  })

  it("deserializes tick", () => {
    const model = createModel(new Map<number, Schema>())
    const message = createMessage()

    setModel(model)

    tick(message, 7)
    decodeMessage(encodeMessage(message), baseHandlers, model)
    expect(baseHandlers.onTick).toHaveBeenCalledWith(7)
  })

  it("deserializes spawned", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const message = createMessage()
    const spawns: EntitySnapshot[] = [[7, [{ __type__: 1, x: 888 }]]]
    const results: EntitySnapshot[] = []
    const handlers = {
      ...baseHandlers,
      onCreate: (...args: EntitySnapshot) => results.push(args),
    }

    setModel(model)

    for (let i = 0; i < spawns.length; i++) {
      spawn(message, ...spawns[i])
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(spawns)
  })

  it("deserializes attached", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const message = createMessage()
    const attaches: EntitySnapshot[] = [[7, [{ __type__: 1, x: 888 }]]]
    const results: EntitySnapshot[] = []
    const handlers = {
      ...baseHandlers,
      onAttach: (...args: EntitySnapshot) => results.push(args),
    }

    setModel(model)

    for (let i = 0; i < attaches.length; i++) {
      const [entity, [component]] = attaches[i]
      attach(message, entity, [component])
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(attaches)
  })

  it("deserializes updated", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const message = createMessage()
    const updates: EntitySnapshot[] = [[7, [{ __type__: 1, x: 888 }]]]
    const results: EntitySnapshot[] = []
    const handlers = {
      ...baseHandlers,
      onUpdate: (...args: EntitySnapshot) => results.push(args),
    }

    setModel(model)

    for (let i = 0; i < updates.length; i++) {
      const [entity, [component]] = updates[i]
      update(message, entity, [component])
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(updates)
  })

  it("deserializes detached", () => {
    const model = createModel(new Map())
    const message = createMessage()
    const detaches: EntitySnapshot[] = [
      [
        5,
        [
          { __type__: 1, x: 9 },
          { __type__: 2, x: 9 },
          { __type__: 4, x: 9 },
        ],
      ],
    ]
    const results: EntityComponentIdsPair[] = []
    const handlers = {
      ...baseHandlers,
      onDetach: (...args: EntityComponentIdsPair) => results.push(args),
    }
    setModel(model)

    for (let i = 0; i < detaches.length; i++) {
      const [entity, components] = detaches[i]
      detach(message, entity, components)
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual([
      [detaches[0][0], detaches[0][1].map(c => c.__type__)],
    ])
  })

  it("deserializes destroyed", () => {
    const model = createModel(new Map())
    const message = createMessage()
    const destroys: Entity[] = [1, 2, 3]
    const results: Entity[] = []
    const handlers = {
      ...baseHandlers,
      onDestroy: (entity: Entity) => results.push(entity),
    }

    setModel(model)

    for (let i = 0; i < destroys.length; i++) {
      destroy(message, destroys[i])
    }

    decodeMessage(encodeMessage(message), handlers, model)
    expect(results).toEqual(destroys)
  })
})
