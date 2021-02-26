import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn(
  (): World => {
    let e = 0
    return {
      id: 1,
      storage: createStorage(),
      addSystem: jest.fn(),
      applyOps: jest.fn(),
      attach: jest.fn(),
      component: jest.fn(),
      componentTypes: [],
      destroy: jest.fn(),
      detach: jest.fn(),
      getComponent: jest.fn(),
      getObservedComponent: jest.fn(),
      isComponentChanged: jest.fn(),
      ops: [],
      patch: jest.fn(),
      removeSystem: jest.fn(),
      spawn: jest.fn(() => e++),
      tick: jest.fn(),
      tryGetComponent: jest.fn(),
      state: {
        currentTick: 0,
        currentTickData: null,
      },
    }
  },
)

export let __CURRENT__WORLD__ = null
