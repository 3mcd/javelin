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
      create: jest.fn(() => e++),
      created: new Set(),
      destroy: jest.fn(),
      destroyed: new Set(),
      getComponent: jest.fn(),
      hasTag: jest.fn(() => true),
      insert: jest.fn(),
      isCommitted: jest.fn(),
      mut: jest.fn(),
      ops: [],
      registerComponentFactory: jest.fn(),
      registeredComponentFactories: [],
      remove: jest.fn(),
      removeTag: jest.fn(),
      tick: jest.fn(),
      tryGetComponent: jest.fn(),
    }
  },
)
