import { component, registerSchema } from "@javelin/ecs"
import {
  createModel,
  initialize,
  InstanceOfSchema,
  Model,
  Schema,
} from "@javelin/core"
import { float64 } from "@javelin/pack"
import { ChangeSet, track } from "@javelin/track"
import { decode, DecodeMessageHandlers } from "./decode"
import { encode } from "./encode"
import { createMessage, insert, MessagePartKind } from "./message"
import * as MessageOp from "./message_op"

const Position = { x: float64, y: float64 }
const Velocity = { x: float64, y: float64 }

registerSchema(Position, 1)
registerSchema(Velocity, 2)

describe("decode", () => {
  let handlers: DecodeMessageHandlers
  beforeEach(() => {
    handlers = {
      onTick: jest.fn(),
      onModel: jest.fn(),
      onSpawn: jest.fn(),
      onAttach: jest.fn(),
      onUpdate: jest.fn(),
      onPatch: jest.fn(),
      onDetach: jest.fn(),
      onDestroy: jest.fn(),
    }
  })
  it("treats empty message as no-op", () => {
    const message = createMessage()
    const encoded = encode(message)
    decode(encoded, handlers)
    for (const prop in handlers) {
      expect(
        (handlers as Record<string, Function>)[prop],
      ).not.toHaveBeenCalled()
    }
  })
  it("decodes tick part", () => {
    const message = createMessage()
    const op = MessageOp.tick(123)
    insert(message, MessagePartKind.Tick, op)
    const encoded = encode(message)
    decode(encoded, handlers)
    expect(handlers.onTick).toHaveBeenCalledWith(123)
  })
  it("decodes model part", () => {
    const config = new Map<number, Schema>([
      [0, Position],
      [1, Velocity],
    ])
    const model = createModel(config)
    const message = createMessage()
    const op = MessageOp.model(model)
    insert(message, MessagePartKind.Model, op)
    const encoded = encode(message)
    let result: Model | undefined = undefined
    decode(encoded, {
      onModel(model) {
        result = model
      },
    })
    expect(JSON.stringify(result)).toBe(JSON.stringify(model))
  })
  it("decodes patch part", () => {
    const config = new Map<number, Schema>([
      [1, Position],
      [2, Velocity],
    ])
    const position = component(Position)
    const velocity = component(Velocity)
    const model = createModel(config)
    const message = createMessage()
    const entity = 0
    const changeset = initialize(
      {} as InstanceOfSchema<typeof ChangeSet>,
      ChangeSet,
    )
    track(changeset, position, "x", -12.6666666)
    track(changeset, velocity, "y", 44)
    const op = MessageOp.patch(model, entity, changeset)
    insert(message, MessagePartKind.Patch, op)
    const encoded = encode(message)
    const results: Parameters<Required<DecodeMessageHandlers>["onPatch"]>[] = []
    decode(
      encoded,
      {
        onPatch(...args) {
          results.push(args)
        },
      },
      model,
    )
    expect(results).toEqual([
      [entity, 1, 0, [], -12.6666666],
      [entity, 2, 1, [], 44],
    ])
  })
})
