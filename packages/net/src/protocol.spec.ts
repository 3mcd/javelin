import { Component } from "@javelin/ecs"
import { field, Schema, uint8 } from "@javelin/pack"
import { decodeMessage, MessageBuilder } from "./protocol_v2"

const schema = {
  componentBase: {
    _tid: field(uint8),
    _cst: field(uint8),
  },
}

describe("protocol_v2", () => {
  it("serializes", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)

    messageBuilder.setTick(999)
    messageBuilder.insertCreated(1, [{ _tid: 1, _cst: 2 }])
    messageBuilder.insertCreated(2, [{ _tid: 1, _cst: 2 }])
    messageBuilder.insertAttached(3, [{ _tid: 1, _cst: 2 }])
    messageBuilder.insertDetached(4, [1, 2, 3])
    messageBuilder.insertDestroyed(5)
    messageBuilder.insertDestroyed(6)

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

  it("deserializes created", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)
    const inserts: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1, _cst: 2 }]],
    ]

    for (let i = 0; i < inserts.length; i++) {
      messageBuilder.insertCreated(...inserts[i])
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

    expect(results).toEqual(inserts)
  })

  it("deserializes attached", () => {
    const model = new Map([[1, schema.componentBase]])
    const messageBuilder = new MessageBuilder(model)
    const attaches: [entity: number, components: Component[]][] = [
      [7, [{ _tid: 1, _cst: 2 }]],
    ]

    for (let i = 0; i < attaches.length; i++) {
      messageBuilder.insertAttached(...attaches[i])
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
      messageBuilder.insertDetached(...detaches[i])
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
      messageBuilder.insertDestroyed(destroys[i])
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

// import { Component } from "@javelin/ecs"
// import {
//   decode,
//   encode,
//   field,
//   float64,
//   Schema,
//   string8,
//   uint8,
// } from "@javelin/pack"

// const schema = {
//   componentBase: {
//     _tid: field(uint8),
//     _cst: field(uint8),
//   },
// }

// function getSchemaByComponentTypeId(componentTypeId: number): Schema {
//   return componentTypeId === 0
//     ? {
//         ...schema.componentBase,
//         x: field(float64),
//         y: field(float64),
//       }
//     : {
//         ...schema.componentBase,
//         firstName: field(string8, 20),
//         lastName: field(string8, 20),
//         nested: {
//           array: [field(uint8)],
//         },
//       }
// }

// describe("protocol", () => {
//   it("does it", () => {
//     const entityComponentsPairs: [entity: number, components: Component[]][] = [
//       [
//         0,
//         [
//           { _tid: 0, _cst: 2, x: 0, y: 0 },
//           {
//             _tid: 1,
//             _cst: 2,
//             firstName: "Daisy",
//             lastName: "McDaniel",
//             nested: { array: [0, 1, 2] },
//           },
//         ],
//       ],
//       [
//         1,
//         [
//           { _tid: 0, _cst: 2, x: -1.1, y: 2.8 },
//           {
//             _tid: 1,
//             _cst: 2,
//             firstName: "Daisy",
//             lastName: "McDaniel",
//             nested: { array: [3, 4, 5, 6, 7, 8] },
//           },
//         ],
//       ],
//       [
//         3,
//         [
//           { _tid: 0, _cst: 2, x: 773.31, y: -3913.4 },
//           {
//             _tid: 1,
//             _cst: 2,
//             firstName: "Daisy",
//             lastName: "McDaniel",
//             nested: { array: [9, 10, 11, 12] },
//           },
//         ],
//       ],
//     ]
//     const buffer = created(entityComponentsPairs)
//     const bufferView = new DataView(buffer)

//     let entity = 0
//     let offset = 0
//     let componentLength = 0
//     let componentTypeId = 0

//     const decodedEntityComponentsPairs = []

//     while (offset < buffer.byteLength) {
//       entity = bufferView.getUint32(offset)
//       offset += 4
//       componentLength = bufferView.getUint8(offset)
//       offset += 1
//       const entityComponentsPair = [entity, [] as Component[]] as const
//       decodedEntityComponentsPairs.push(entityComponentsPair)
//       for (let i = 0; i < componentLength; i++) {
//         componentTypeId = bufferView.getUint8(offset)
//         offset += 1
//         const encodedComponentLength = bufferView.getUint32(offset)
//         offset += 4
//         const component = decode(
//           buffer.slice(offset, offset + encodedComponentLength),
//           getSchemaByComponentTypeId(componentTypeId),
//         )
//         entityComponentsPair[1].push(component)
//         offset += encodedComponentLength
//       }
//     }

//     expect(decodedEntityComponentsPairs).toEqual(entityComponentsPairs)
//   })
// })
