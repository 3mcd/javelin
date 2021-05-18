import { createArchetype } from "../archetype"
import { createSignal } from "../signal"
import { Storage } from "../storage"

export const createStorage = jest.fn((): Storage => {
  let e = 0
  return {
    archetypes: [createArchetype({ signature: [] })],
    clear: jest.fn(),
    destroy: jest.fn(),
    findComponent: jest.fn(() => ({ type: 0 } as any)),
    findComponentBySchemaId: jest.fn(() => ({ type: 0 } as any)),
    getEntityComponents: jest.fn(() => []),
    hasComponent: jest.fn(),
    insert: jest.fn(),
    remove: jest.fn(),
    snapshot: jest.fn(),
    upsert: jest.fn(),
    entityRelocating: createSignal(),
    entityRelocated: createSignal(),
    archetypeCreated: createSignal(),
  }
})
