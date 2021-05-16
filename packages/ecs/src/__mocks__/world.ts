import { createModel } from "@javelin/core"
import { createSignal } from "../signal"
import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn(
  (): World => {
    let e = 0
    return {
      addSystem: jest.fn(),
      addTopic: jest.fn(),
      attach: jest.fn(),
      attachImmediate: jest.fn(),
      destroy: jest.fn(),
      destroyImmediate: jest.fn(),
      detach: jest.fn(),
      detachImmediate: jest.fn(),
      get: jest.fn(),
      has: jest.fn(),
      id: 1,
      removeSystem: jest.fn(),
      removeTopic: jest.fn(),
      reserve: jest.fn(() => e++),
      reset: jest.fn(),
      snapshot: jest.fn(),
      spawn: jest.fn(() => e++),
      spawnImmediate: jest.fn(() => e++),
      state: {
        currentTick: 0,
        currentTickData: null,
        currentSystem: 0,
      },
      storage: createStorage(),
      tick: jest.fn(),
      tryGet: jest.fn(),
      attached: createSignal(),
      detached: createSignal(),
      spawned: createSignal(),
      destroyed: createSignal(),
    }
  },
)

export let currentWorldId = null
