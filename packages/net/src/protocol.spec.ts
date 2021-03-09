import { Component } from "@javelin/ecs"
import { field, Schema, uint8 } from "@javelin/pack"
import { decodeMessage, MessageBuilder } from "./protocol_v2"

const schema = {
  componentBase: {
    _tid: field(uint8),
    _cst: field(uint8),
  },
}

describe("protocol", () => {
  it("serializes", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)

    messageBuilder.setTick(999)
    messageBuilder.spawn(1, [{ _tid: 1, _cst: 2 }])
    messageBuilder.spawn(2, [{ _tid: 1, _cst: 2 }])
    messageBuilder.attach(3, [{ _tid: 1, _cst: 2 }])
    messageBuilder.detach(4, [1, 2, 3])
    messageBuilder.destroy(5)
    messageBuilder.destroy(6)

    expect(() => messageBuilder.encode()).not.toThrow()
  })

  it("deserializes tick", () => {
    const model = new Map<number, Schema>()
    const messageBuilder = new MessageBuilder(model)

    messageBuilder.setTick(7)

    let tick = -1

    decodeMessage(
      messageBuilder.encode(),
      model,
      t => (tick = t),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
    )

    expect(tick).toBe(7)
  })

  it("deserializes spawned", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)
    const spawns: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1, _cst: 2 }]],
    ]

    for (let i = 0; i < spawns.length; i++) {
      messageBuilder.spawn(...spawns[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(
      messageBuilder.encode(),
      model,
      jest.fn(),
      (...args) => results.push(args),
      jest.fn(),
      jest.fn(),
      jest.fn(),
    )

    expect(results).toEqual(spawns)
  })

  it("deserializes attached", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)
    const attaches: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1, _cst: 2 }]],
    ]

    for (let i = 0; i < attaches.length; i++) {
      messageBuilder.attach(...attaches[i])
    }

    const results: [entity: number, components: Component[]][] = []

    decodeMessage(
      messageBuilder.encode(),
      model,
      jest.fn(),
      jest.fn(),
      (...args) => results.push(args),
      jest.fn(),
      jest.fn(),
    )

    expect(results).toEqual(attaches)
  })

  it("deserializes detached", () => {
    const model = new Map()
    const messageBuilder = new MessageBuilder(model)
    const detaches: [entity: number, componentTypeIds: number[]][] = [
      [5, [1, 2, 4]],
    ]

    for (let i = 0; i < detaches.length; i++) {
      messageBuilder.detach(...detaches[i])
    }

    const results: [entity: number, componentTypeIds: number[]][] = []

    decodeMessage(
      messageBuilder.encode(),
      model,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      (...args) => results.push(args),
      jest.fn(),
    )

    expect(results).toEqual(detaches)
  })

  it("deserializes destroyed", () => {
    const model = new Map()
    const messageBuilder = new MessageBuilder(model)
    const destroys = [2, 7, 12, 100]

    for (let i = 0; i < destroys.length; i++) {
      messageBuilder.destroy(destroys[i])
    }

    const results: number[] = []

    decodeMessage(
      messageBuilder.encode(),
      model,
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
      entity => results.push(entity),
    )

    expect(results).toEqual(destroys)
  })
})
