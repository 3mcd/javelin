import { createArchetype } from "../archetype"
import { createSignal } from "../signal"
import { Storage } from "../storage"

export const createStorage = jest.fn((): Storage => {
  let e = 0
  return {
    archetypeCreated: createSignal(),
    archetypes: [createArchetype({ signature: [] })],
    entityRelocated: createSignal(),
    entityRelocating: createSignal(),
    attachComponents: jest.fn(),
    attachOrUpdateComponents: jest.fn(),
    clearComponents: jest.fn(),
    detachBySchemaId: jest.fn(),
    getComponentsBySchema: jest.fn(() => ({ type: 0 } as any)),
    getComponentsBySchemaId: jest.fn(() => ({ type: 0 } as any)),
    getAllComponents: jest.fn(() => []),
    getSnapshot: jest.fn(),
    hasComponentOfSchema: jest.fn(),
    reset: jest.fn(),
  }
})
