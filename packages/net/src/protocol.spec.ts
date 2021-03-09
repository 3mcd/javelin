import { Component } from "@javelin/ecs"
import { Entity } from "@javelin/ecs/src/entity"
import { field, Schema, uint8 } from "@javelin/pack"
import { decodeMessage, MessageBuilder } from "./protocol_v2"

const schema = {
  componentBase: {
    _tid: field(uint8),
  },
}

describe("protocol", () => {
  it("serializes", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)

    messageBuilder.setTick(999)
    messageBuilder.spawn(1, [{ _tid: 1 }])
    messageBuilder.spawn(2, [{ _tid: 1 }])
    messageBuilder.attach(3, [{ _tid: 1 }])
    messageBuilder.detach(4, [1, 2, 3])
    messageBuilder.destroy(5)
    messageBuilder.destroy(6)

    expect(() => messageBuilder.encode()).not.toThrow()
  })

  it("deserializes tick", () => {
    const model = new Map<number, Schema>()
    const messageBuilder = new MessageBuilder(model)
    const handlers = {
      onModel: jest.fn(),
      onTick: (t: number) => (tick = t),
      onCreate: jest.fn(),
      onAttach: jest.fn(),
      onUpdate: jest.fn(),
      onDetach: jest.fn(),
      onDestroy: jest.fn(),
    }

    messageBuilder.setTick(7)

    let tick = -1

    decodeMessage(messageBuilder.encode(), model, handlers)

    expect(tick).toBe(7)
  })

  it("deserializes spawned", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)
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
      messageBuilder.spawn(...spawns[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(messageBuilder.encode(), model, handlers)

    expect(results).toEqual(spawns)
  })

  it("deserializes attached", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)
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
      messageBuilder.attach(...attaches[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(messageBuilder.encode(), model, handlers)

    expect(results).toEqual(attaches)
  })

  it("deserializes updated", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)
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
      messageBuilder.update(...updates[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(messageBuilder.encode(), model, handlers)

    expect(results).toEqual(updates)
  })

  it("deserializes detached", () => {
    const model = new Map()
    const messageBuilder = new MessageBuilder(model)
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
      messageBuilder.detach(...detaches[i])
    }

    const results: [entity: number, componentTypeIds: number[]][] = []

    decodeMessage(messageBuilder.encode(), model, handlers)

    expect(results).toEqual(detaches)
  })

  it("deserializes destroyed", () => {
    const model = new Map()
    const messageBuilder = new MessageBuilder(model)
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
      messageBuilder.destroy(destroys[i])
    }

    const results: number[] = []

    decodeMessage(messageBuilder.encode(), model, handlers)

    expect(results).toEqual(destroys)
  })
})
