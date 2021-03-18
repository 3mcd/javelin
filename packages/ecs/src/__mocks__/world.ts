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
      getComponent: jest.fn(),
      getObservedComponent: jest.fn(),
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
      tryGetComponent: jest.fn(),
      attached: createSignal(),
      detached: createSignal(),
      destroyed: createSignal(),
    }
  },
)

export let __CURRENT_WORLD__ = null
