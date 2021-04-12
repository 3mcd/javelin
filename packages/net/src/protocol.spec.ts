import { Component } from "@javelin/ecs"
import { Entity } from "@javelin/ecs/src/entity"
import {
  arrayOf,
  createModel,
  Model,
  ModelConfig,
  Schema,
} from "@javelin/model"
import { float64, uint32, uint8 } from "@javelin/pack"
import { decodeMessage, MessageBuilder } from "./protocol"

const baseSchema = {
  _tid: uint8,
}

const baseHandlers = {
  onModel: jest.fn(),
  onTick: jest.fn(),
  onCreate: jest.fn(),
  onAttach: jest.fn(),
  onUpdate: jest.fn(),
  onDetach: jest.fn(),
  onDestroy: jest.fn(),
  onPatch: jest.fn(),
}

describe("protocol", () => {
  it("serializes", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const builder = new MessageBuilder(model)

    builder.setTick(999)
    builder.spawn(1, [{ _tid: 1 }])
    builder.spawn(2, [{ _tid: 1 }])
    builder.attach(3, [{ _tid: 1 }])
    builder.detach(4, [1, 2, 3])
    builder.destroy(5)
    builder.destroy(6)

    expect(() => builder.encode()).not.toThrow()
  })

  it("deserializes tick", () => {
    const model = createModel(new Map<number, Schema>())
    const builder = new MessageBuilder(model)
    const handlers = {
      ...baseHandlers,
      onTick: (t: number) => (tick = t),
    }

    builder.setTick(7)

    let tick = -1

    decodeMessage(builder.encode(), handlers, model)

    expect(tick).toBe(7)
  })

  it("deserializes spawned", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const builder = new MessageBuilder(model)
    const spawns: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1 }]],
    ]
    const handlers = {
      ...baseHandlers,
      onCreate: (...args: [Entity, Component[]]) => results.push(args),
    }

    for (let i = 0; i < spawns.length; i++) {
      builder.spawn(...spawns[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(spawns)
  })

  it("deserializes attached", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const builder = new MessageBuilder(model)
    const attaches: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1 }]],
    ]
    const handlers = {
      ...baseHandlers,
      onAttach: (...args: [Entity, Component[]]) => results.push(args),
    }

    for (let i = 0; i < attaches.length; i++) {
      builder.attach(...attaches[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(attaches)
  })

  it("deserializes updated", () => {
    const model = createModel(new Map([[1, baseSchema]]))
    const builder = new MessageBuilder(model)
    const updates: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1 }]],
    ]
    const handlers = {
      ...baseHandlers,
      onUpdate: (...args: [Entity, Component[]]) => results.push(args),
    }

    for (let i = 0; i < updates.length; i++) {
      builder.update(...updates[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(updates)
  })

  it("deserializes detached", () => {
    const model = createModel(new Map())
    const builder = new MessageBuilder(model)
    const detaches: [entity: number, componentTypeIds: number[]][] = [
      [5, [1, 2, 4]],
    ]
    const handlers = {
      ...baseHandlers,
      onDetach: (...args: [Entity, number[]]) => results.push(args),
    }

    for (let i = 0; i < detaches.length; i++) {
      builder.detach(...detaches[i])
    }

    const results: [entity: number, componentTypeIds: number[]][] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(detaches)
  })

  it("deserializes destroyed", () => {
    const model = createModel(new Map())
    const builder = new MessageBuilder(model)
    const destroys = [2, 7, 12, 100]
    const handlers = {
      ...baseHandlers,
      onDestroy: (entity: Entity) => results.push(entity),
    }

    for (let i = 0; i < destroys.length; i++) {
      builder.destroy(destroys[i])
    }

    const results: number[] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(destroys)
  })

  it("deserializes model", () => {
    const model = createModel(
      new Map([
        [
          0,
          {
            // Note: keys are sorted alphabetically below since model encodes
            // keys alphabetically
            _tid: uint8,
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
            _tid: uint8,
          } as Schema,
        ],
      ]),
    )
    const builder = new MessageBuilder(model)
    const handlers = {
      ...baseHandlers,
    }

    builder.model(model)

    decodeMessage(builder.encode(), handlers, model)

    const snapshot = (model: Model) => JSON.stringify(model)
    const emitted = handlers.onModel.mock.calls[0][0]

    expect(snapshot(emitted)).toEqual(snapshot(model))
  })
})
