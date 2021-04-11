import { Component } from "@javelin/ecs"
import { Entity } from "@javelin/ecs/src/entity"
import { field, float64, int8, Schema, uint32, uint8 } from "@javelin/pack"
import {
  decodeMessage,
  MessageBuilder,
  encodeModel,
  decodeModel,
  flattenSchema,
} from "./protocol_v2"

const schema = {
  componentBase: {
    _tid: field(uint8),
  },
}

describe("protocol", () => {
  it("serializes", () => {
    const model = new Map([[1, schema.componentBase]])
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
    const model = new Map<number, Schema>()
    const builder = new MessageBuilder(model)
    const handlers = {
      onModel: jest.fn(),
      onTick: (t: number) => (tick = t),
      onCreate: jest.fn(),
      onAttach: jest.fn(),
      onUpdate: jest.fn(),
      onDetach: jest.fn(),
      onDestroy: jest.fn(),
    }

    builder.setTick(7)

    let tick = -1

    decodeMessage(builder.encode(), handlers, model)

    expect(tick).toBe(7)
  })

  it("deserializes spawned", () => {
    const model = new Map([[1, schema.componentBase]])
    const builder = new MessageBuilder(model)
    const spawns: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1 }]],
    ]
    const handlers = {
      onModel: jest.fn(),
      onTick: jest.fn(),
      onCreate: (...args: [Entity, Component[]]) => results.push(args),
      onAttach: jest.fn(),
      onUpdate: jest.fn(),
      onDetach: jest.fn(),
      onDestroy: jest.fn(),
    }

    for (let i = 0; i < spawns.length; i++) {
      builder.spawn(...spawns[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(spawns)
  })

  it("deserializes attached", () => {
    const model = new Map([[1, schema.componentBase]])
    const builder = new MessageBuilder(model)
    const attaches: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1 }]],
    ]
    const handlers = {
      onModel: jest.fn(),
      onTick: jest.fn(),
      onCreate: jest.fn(),
      onAttach: (...args: [Entity, Component[]]) => results.push(args),
      onUpdate: jest.fn(),
      onDetach: jest.fn(),
      onDestroy: jest.fn(),
    }

    for (let i = 0; i < attaches.length; i++) {
      builder.attach(...attaches[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(attaches)
  })

  it("deserializes updated", () => {
    const model = new Map([[1, schema.componentBase]])
    const builder = new MessageBuilder(model)
    const updates: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1 }]],
    ]
    const handlers = {
      onModel: jest.fn(),
      onTick: jest.fn(),
      onCreate: jest.fn(),
      onAttach: jest.fn(),
      onUpdate: (...args: [Entity, Component[]]) => results.push(args),
      onDetach: jest.fn(),
      onDestroy: jest.fn(),
    }

    for (let i = 0; i < updates.length; i++) {
      builder.update(...updates[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(updates)
  })

  it("deserializes detached", () => {
    const model = new Map()
    const builder = new MessageBuilder(model)
    const detaches: [entity: number, componentTypeIds: number[]][] = [
      [5, [1, 2, 4]],
    ]
    const handlers = {
      onModel: jest.fn(),
      onTick: jest.fn(),
      onCreate: jest.fn(),
      onAttach: jest.fn(),
      onUpdate: jest.fn(),
      onDetach: (...args: [Entity, number[]]) => results.push(args),
      onDestroy: jest.fn(),
    }

    for (let i = 0; i < detaches.length; i++) {
      builder.detach(...detaches[i])
    }

    const results: [entity: number, componentTypeIds: number[]][] = []

    decodeMessage(builder.encode(), handlers, model)

    expect(results).toEqual(detaches)
  })

  it("deserializes destroyed", () => {
    const model = new Map()
    const builder = new MessageBuilder(model)
    const destroys = [2, 7, 12, 100]
    const handlers = {
      onModel: jest.fn(),
      onTick: jest.fn(),
      onCreate: jest.fn(),
      onAttach: jest.fn(),
      onUpdate: jest.fn(),
      onDetach: jest.fn(),
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
    const model = new Map([
      [
        0,
        {
          _tid: field(uint8),
          x: field(float64),
          nested: { a: field(uint32) },
          arr_simple: [field(uint8)],
          arr_schema: [
            {
              y: field(float64),
            },
          ],
        } as any,
      ],
      [
        1,
        {
          _tid: field(uint8),
        },
      ],
    ])
    const builder = new MessageBuilder(model)
    const handlers = {
      onModel: jest.fn(),
      onTick: jest.fn(),
      onCreate: jest.fn(),
      onAttach: jest.fn(),
      onUpdate: jest.fn(),
      onDetach: jest.fn(),
      onDestroy: jest.fn(),
    }

    builder.model(model)

    decodeMessage(builder.encode(), handlers, model)

    expect([...handlers.onModel.mock.calls[0][0].entries()]).toEqual([
      ...model.entries(),
    ])
  })
})
