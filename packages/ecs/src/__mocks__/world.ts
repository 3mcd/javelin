import { $worldStorageKey } from "../symbols"
import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn(
  (): World => {
    let e = 0
    return {
      [$worldStorageKey]: createStorage(),
      addSystem: jest.fn(),
      addTag: jest.fn(),
      applyOps: jest.fn(),
      attach: jest.fn(),
      attached: new Set(),
      spawn: jest.fn(() => e++),
      component: jest.fn(),
      destroy: jest.fn(),
      detach: jest.fn(),
      getComponent: jest.fn(),
      hasTag: jest.fn(() => true),
      mut: jest.fn(),
      ops: [],
      registerComponentType: jest.fn(),
      componentTypes: [],
      removeTag: jest.fn(),
      tick: jest.fn(),
      tryGetComponent: jest.fn(),
    }
  },
)
