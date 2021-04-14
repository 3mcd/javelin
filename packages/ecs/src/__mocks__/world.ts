import { createModel } from "@javelin/model"
import { createSignal } from "../signal"
import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn(
  (): World => {
    let e = 0
    return {
      addSystem: jest.fn(),
      addTopic: jest.fn(),
      applyOps: jest.fn(),
      attach: jest.fn(),
      component: jest.fn(),
      componentTypes: [],
      destroy: jest.fn(),
      detach: jest.fn(),
      get: jest.fn(),
      has: jest.fn(),
      id: 1,
      ops: [],
      removeSystem: jest.fn(),
      removeTopic: jest.fn(),
      reserve: jest.fn(() => e++),
      reset: jest.fn(),
      snapshot: jest.fn(),
      spawn: jest.fn(() => e++),
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
      getModel: jest.fn(() => createModel(new Map())),
    }
  },
)

export let __CURRENT_WORLD__ = null
