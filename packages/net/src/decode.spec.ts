// import {
//   arrayOf,
//   createModel,
//   FieldExtract,
//   initializeWithSchema,
//   mapOf,
//   Model,
//   Schema,
// } from "@javelin/core"
// import { component, registerSchema } from "@javelin/ecs"
// import { enhanceModel, float32, float64, int8, uint16 } from "@javelin/pack"
// import { ChangeSet, set } from "@javelin/track"
// import { decode, DecodeMessageHandlers } from "./decode"
// import { encode } from "./encode"
// import { createMessage, insert, MessagePartKind } from "./message"
// import * as MessageOp from "./message_op"

// const Position = { x: float64, y: float64 }
// const Velocity = { x: float64, y: float64 }
// const Complex = {
//   nested: { foo: uint16 },
//   array: arrayOf(arrayOf({ deep: float32 })),
// }
// const A = { value: int8 }
// const B = { value: mapOf(float64, float64) }

// registerSchema(Position, 1)
// registerSchema(Velocity, 2)
// registerSchema(Complex, 3)

// describe("decode", () => {
//   let handlers: DecodeMessageHandlers
//   beforeEach(() => {
//     handlers = {
//       onModel: jest.fn(),
//       onAttach: jest.fn(),
//       onUpdate: jest.fn(),
//       onPatch: jest.fn(),
//       onDetach: jest.fn(),
//       onDestroy: jest.fn(),
//     }
//   })
//   it("treats empty message as no-op", () => {
//     const message = createMessage()
//     const encoded = encode(message)
//     decode(encoded, handlers)
//     for (const prop in handlers) {
//       expect(
//         (handlers as Record<string, Function>)[prop],
//       ).not.toHaveBeenCalled()
//     }
//   })
//   it("decodes model part", () => {
//     const config = new Map<number, Schema>([
//       [0, Position],
//       [1, Velocity],
//       [2, A],
//       [3, B],
//     ])
//     const model = enhanceModel(createModel(config))
//     const message = createMessage()
//     const op = MessageOp.model(model)
//     insert(message, MessagePartKind.Model, op)
//     const encoded = encode(message)
//     let result: Model | undefined = undefined
//     decode(encoded, {
//       onModel(model) {
//         result = model
//       },
//     })
//     expect(JSON.stringify(result)).toBe(JSON.stringify(model))
//   })
//   it("decodes patch part", () => {
//     const config = new Map<number, Schema>([
//       [1, Position],
//       [2, Velocity],
//       [3, Complex],
//     ])
//     const position = component(Position)
//     const velocity = component(Velocity)
//     const complex = component(Complex)
//     const model = enhanceModel(createModel(config))
//     const message = createMessage()
//     const entity = 0
//     const changeset = initializeWithSchema(
//       {} as FieldExtract<typeof ChangeSet>,
//       ChangeSet,
//     )
//     set(position, changeset, "x", -12.6666666)
//     set(velocity, changeset, "y", 44)
//     set(complex, changeset, "array.0", [{ deep: 999 }])
//     set(complex, changeset, "nested", { foo: 1 })
//     const op = MessageOp.patch(model, entity, changeset)
//     insert(message, MessagePartKind.Patch, op)
//     const encoded = encode(message)
//     const results: Parameters<Required<DecodeMessageHandlers>["onPatch"]>[] = []
//     decode(
//       encoded,
//       {
//         onPatch(...args) {
//           results.push(JSON.parse(JSON.stringify(args)))
//         },
//       },
//       model,
//     )
//     expect(results).toEqual([
//       [entity, 1, 1, [], -12.6666666],
//       [entity, 2, 2, [], 44],
//       [entity, 3, 4, [0], [{ deep: 999 }]],
//       [entity, 3, 1, [], { foo: 1 }],
//     ])
//   })
// })
