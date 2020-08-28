import { $worldStorageKey } from "../symbols"
import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn(
  (): World => {
    let e = 0
    return {
      [$worldStorageKey]: createStorage(),
      addSystem: jest.fn(),
      applyComponentPatch: jest.fn(),
      applyOps: jest.fn(),
      attach: jest.fn(),
      attached: new Set(),
      component: jest.fn(),
      componentTypes: [],
      destroy: jest.fn(),
      detach: jest.fn(),
      detached: new Set(),
      getComponent: jest.fn(),
      getMutableComponent: jest.fn(),
      isComponentChanged: jest.fn(),
      ops: [],
      registerComponentType: jest.fn(),
      spawn: jest.fn(() => e++),
      tick: jest.fn(),
      tryGetComponent: jest.fn(),
    }
  },
)
