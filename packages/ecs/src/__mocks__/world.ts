import { createSignal } from "../signal"
import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn(
  (): World => {
    let e = 0
    return {
      addSystem: jest.fn(),
      applyOps: jest.fn(),
      attach: jest.fn(),
      component: jest.fn(),
      componentTypes: [],
      destroy: jest.fn(),
      detach: jest.fn(),
      get: jest.fn(),
      getObserved: jest.fn(),
      has: jest.fn(),
      id: 1,
      isComponentChanged: jest.fn(),
      ops: [],
      patch: jest.fn(),
      removeSystem: jest.fn(),
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
    }
  },
)

export let __CURRENT_WORLD__ = null
