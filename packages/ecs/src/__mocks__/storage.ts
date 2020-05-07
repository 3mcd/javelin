import { Storage } from "../storage"

export function createStorage(): Storage {
  let e = 0
  return {
    archetypes: [],
    insert: jest.fn(),
    create: jest.fn(() => e++),
    destroy: jest.fn(),
    addTag: jest.fn(),
    removeTag: jest.fn(),
    hasTag: jest.fn(() => true),
    incrementVersion: jest.fn(),
    patch: jest.fn(() => true),
    findComponent: jest.fn(() => ({ _t: 0, _e: 0, _v: 0 } as any)),
    registerComponentFactory: jest.fn(),
  }
}
