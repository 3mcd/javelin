import { createMessageHandler } from "./message_handler"
import { UpdateUnreliable, JavelinMessageType, protocol } from "./protocol"
import { World, WorldOpType } from "@javelin/ecs"

describe("createMessageHandler", () => {
  it("applies component patches", () => {
    const applyComponentPatch = jest.fn()
    const spawn = jest.fn()
    const messageHandler = createMessageHandler()
    const world = ({
      applyComponentPatch,
      applyOps: jest.fn(),
      spawn,
    } as any) as World
    const update: UpdateUnreliable = [
      JavelinMessageType.UpdateUnreliable,
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
      [WorldOpType.Spawn, 0, [{ type: 0, x: 0, y: 0, z: 0 }]],
    ])
    const opsB = protocol.ops([
      [WorldOpType.Spawn, 1, [{ type: 0, x: 0, y: 0, z: 0 }]],
    ])

    spawn.mockReturnValue(0)
    messageHandler.push(opsA)
    messageHandler.system(world, null)

    spawn.mockReturnValue(1)
    messageHandler.push(opsB)
    messageHandler.system(world, null)

    messageHandler.applyUnreliableUpdate(update, world)

    expect(applyComponentPatch).toHaveBeenCalledTimes(6)
    expect(applyComponentPatch).nthCalledWith(1, 0, 0, "x", 1)
    expect(applyComponentPatch).nthCalledWith(2, 0, 0, "y", 2)
    expect(applyComponentPatch).nthCalledWith(3, 0, 0, "z", 3)
    expect(applyComponentPatch).nthCalledWith(4, 1, 0, "x", 4)
    expect(applyComponentPatch).nthCalledWith(5, 1, 0, "y", 5)
    expect(applyComponentPatch).nthCalledWith(6, 1, 0, "z", 6)
  })

  it("skips unregistered entities", () => {
    const applyComponentPatch = jest.fn()
    const spawn = jest.fn()
    const messageHandler = createMessageHandler()
    const world = ({
      applyComponentPatch,
      applyOps: jest.fn(),
      spawn,
    } as any) as World
    const update: UpdateUnreliable = [
      JavelinMessageType.UpdateUnreliable,
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
      [WorldOpType.Spawn, 0, [{ type: 0, x: 0, y: 0, z: 0 }]],
    ])
    const opsB = protocol.ops([
      [WorldOpType.Spawn, 1, [{ type: 0, x: 0, y: 0, z: 0 }]],
    ])

    spawn.mockReturnValue(0)
    messageHandler.push(opsA)
    messageHandler.system(world, null)

    spawn.mockReturnValue(1)
    messageHandler.push(opsB)
    messageHandler.system(world, null)

    messageHandler.applyUnreliableUpdate(update, world)

    expect(applyComponentPatch).toHaveBeenCalledTimes(2)
    expect(applyComponentPatch).nthCalledWith(1, 0, 0, "x", 1)
    expect(applyComponentPatch).nthCalledWith(2, 1, 0, "x", 3)
  })
})
