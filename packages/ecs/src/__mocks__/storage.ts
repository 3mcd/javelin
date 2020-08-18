import { Storage } from "../storage"

export const createStorage = jest.fn(
  (): Storage => {
    let e = 0
    return {
      archetypes: [],
      create: jest.fn(() => e++),
      destroy: jest.fn(),
      findComponent: jest.fn(() => ({ _t: 0, _v: 0 } as any)),
      getEntityComponents: jest.fn(() => []),
      incrementVersion: jest.fn(),
      insert: jest.fn(),
      remove: jest.fn(),
      removeByTypeIds: jest.fn(),
      upsert: jest.fn(() => true),
    }
  },
)
