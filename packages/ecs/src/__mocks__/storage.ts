import { Storage } from "../storage"

export const createStorage = jest.fn(
  (): Storage => {
    let e = 0
    return {
      patch: jest.fn(() => true),
      archetypes: [],
      clearMutations: jest.fn(),
      create: jest.fn(() => e++),
      destroy: jest.fn(),
      findComponent: jest.fn(() => ({ type: 0 } as any)),
      findComponentByComponentTypeId: jest.fn(() => ({ type: 0 } as any)),
      getComponentMutations: jest.fn(),
      getEntityComponents: jest.fn(() => []),
      getObservedComponent: jest.fn((x: any) => x),
      insert: jest.fn(),
      isComponentChanged: jest.fn(() => true),
      remove: jest.fn(),
      removeByTypeIds: jest.fn(),
      upsert: jest.fn(),
    }
  },
)
