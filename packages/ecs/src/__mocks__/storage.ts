import { createArchetype } from "../archetype"
import { createSignal } from "../signal"
import { Storage } from "../storage"

export const createStorage = jest.fn((): Storage => {
  return {
    archetypeCreated: createSignal(),
    archetypes: [createArchetype({ type: [] })],
    entityRelocated: createSignal(),
    entityRelocating: createSignal(),
    attachComponents: jest.fn(),
    attachOrUpdateComponents: jest.fn(),
    clearComponents: jest.fn(),
    detachBySchemaId: jest.fn(),
    getComponentBySchema: jest.fn(() => ({ type: 0 } as any)),
    getComponentBySchemaId: jest.fn(() => ({ type: 0 } as any)),
    getAllComponents: jest.fn(() => []),
    createSnapshot: jest.fn(),
    hasComponentOfSchema: jest.fn(),
    clear: jest.fn(),
  }
})
