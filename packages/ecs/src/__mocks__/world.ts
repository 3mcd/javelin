import { $worldStorageKey } from "../symbols"
import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn(
  (): World => {
    let e = 0
    return {
      [$worldStorageKey]: createStorage(),
      addSystem: jest.fn(),
      applyOps: jest.fn(),
      attach: jest.fn(),
      attached: new Set(),
      spawn: jest.fn(() => e++),
      component: jest.fn(),
      destroy: jest.fn(),
      detach: jest.fn(),
      getComponent: jest.fn(),
      mut: jest.fn(),
      ops: [],
      registerComponentType: jest.fn(),
      componentTypes: [],
      tick: jest.fn(),
      tryGetComponent: jest.fn(),
    }
  },
)
