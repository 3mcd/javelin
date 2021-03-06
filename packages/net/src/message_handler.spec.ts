import { World, WorldOpType } from "@javelin/ecs"
import { createMessageHandler } from "./message_handler"
import {
  JavelinMessageType,
  protocol,
  Update,
  UpdateUnreliable,
} from "./protocol"

describe("createMessageHandler", () => {
  it("applies reliable component updates", () => {
    const patch = jest.fn()
    const reserve = jest.fn()
    const messageHandler = createMessageHandler()
    const world = ({
      patch,
      applyOps: jest.fn(),
      reserve,
    } as any) as World
    const update: Update = [
      JavelinMessageType.Update,
      false,
      null,
      // entity 0
      0,
      0,
      "x",
      1,
      "y",
      2,
      "z",
      3,
      // entity 1
      1,
      0,
      "x",
      4,
      "y",
      5,
      "z",
      6,
    ]
    const opsA = protocol.ops([
      [WorldOpType.Spawn as const, 0],
      [WorldOpType.Attach, 0, [{ _tid: 0, x: 0, y: 0, z: 0 }]],
    ])
    const opsB = protocol.ops([
      [WorldOpType.Spawn as const, 1],
      [WorldOpType.Attach, 1, [{ _tid: 0, x: 0, y: 0, z: 0 }]],
    ])

    reserve.mockReturnValue(0)
    messageHandler.push(opsA)
    messageHandler.system(world)

    reserve.mockReturnValue(1)
    messageHandler.push(opsB)
    messageHandler.system(world)

    messageHandler.push(update)
    messageHandler.system(world)

    expect(patch).toHaveBeenCalledTimes(6)
    expect(patch).nthCalledWith(1, 0, 0, "x", 1)
    expect(patch).nthCalledWith(2, 0, 0, "y", 2)
    expect(patch).nthCalledWith(3, 0, 0, "z", 3)
    expect(patch).nthCalledWith(4, 1, 0, "x", 4)
    expect(patch).nthCalledWith(5, 1, 0, "y", 5)
    expect(patch).nthCalledWith(6, 1, 0, "z", 6)
  })

  it("skips unregistered entities when applying reliable updates", () => {
    const patch = jest.fn()
    const reserve = jest.fn()
    const messageHandler = createMessageHandler()
    const world = ({
      patch,
      applyOps: jest.fn(),
      reserve,
    } as any) as World
    const update: Update = [
      JavelinMessageType.Update,
      false,
      null,
      // entity 0 (registered)
      0,
      0,
      "x",
      1,
      // entity 99 (unregistered)
      99,
      0,
      "x",
      2,
      // entity 1 (registered)
      1,
      0,
      "x",
      3,
    ]
    const opsA = protocol.ops([
      [WorldOpType.Spawn as const, 0],
      [WorldOpType.Attach, 0, [{ _tid: 0, x: 0, y: 0, z: 0 }]],
    ])
    const opsB = protocol.ops([
      [WorldOpType.Spawn as const, 1],
      [WorldOpType.Attach, 1, [{ _tid: 0, x: 0, y: 0, z: 0 }]],
    ])

    reserve.mockReturnValue(0)
    messageHandler.push(opsA)
    messageHandler.system(world)

    reserve.mockReturnValue(1)
    messageHandler.push(opsB)
    messageHandler.system(world)

    messageHandler.push(update)
    messageHandler.system(world)

    expect(patch).toHaveBeenCalledTimes(2)
    expect(patch).nthCalledWith(1, 0, 0, "x", 1)
    expect(patch).nthCalledWith(2, 1, 0, "x", 3)
  })

  it("applies unreliable component updates", () => {
    const upsertCallArgs: any[] = []
    const upsert = jest.fn((...args: any[]) => {
      upsertCallArgs.push(JSON.parse(JSON.stringify(args)))
    })
    const reserve = jest.fn()
    const messageHandler = createMessageHandler()
    const world = ({
      storage: {
        upsert,
      },
      applyOps: jest.fn(),
      reserve,
    } as any) as World
    const update: UpdateUnreliable = [
      JavelinMessageType.UpdateUnreliable,
      false,
      null,
      // entity 0 (registered)
      0,
      { _tid: 0, x: 1, y: 1 },
      // entity 1 (registered)
      1,
      { _tid: 0, x: 2, y: 2 },
    ]
    const opsA = protocol.ops([
      [WorldOpType.Spawn as const, 0],
      [WorldOpType.Attach, 0, [{ _tid: 0, x: 0, y: 0 }]],
    ])
    const opsB = protocol.ops([
      [WorldOpType.Spawn as const, 1],
      [WorldOpType.Attach, 1, [{ _tid: 0, x: 0, y: 0 }]],
    ])

    reserve.mockReturnValue(0)
    messageHandler.push(opsA)
    messageHandler.system(world)

    reserve.mockReturnValue(1)
    messageHandler.push(opsB)
    messageHandler.system(world)

    messageHandler.handleUnreliableUpdate(update, world)

    expect(upsert).toHaveBeenCalledTimes(2)
    expect(upsertCallArgs[0]).toEqual([0, [{ _tid: 0, x: 1, y: 1 }]])
    expect(upsertCallArgs[1]).toEqual([1, [{ _tid: 0, x: 2, y: 2 }]])
  })
})
