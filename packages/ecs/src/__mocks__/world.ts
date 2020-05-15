import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn(
  (): World => {
    let e = 0
    return {
      insert: jest.fn(),
      create: jest.fn(() => e++),
      destroy: jest.fn(),
      addTag: jest.fn(),
      removeTag: jest.fn(),
      hasTag: jest.fn(() => true),
      mut: jest.fn(),
      tick: jest.fn(),
      created: new Set(),
      destroyed: new Set(),
      storage: createStorage(),
      query: jest.fn(),
      isEphemeral: jest.fn(),
      registerComponentFactory: jest.fn(),
    }
  },
)
