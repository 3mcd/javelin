import { Archetype } from "../archetype"

export const createArchetype = jest.fn(({ type }): Archetype => {
  return {
    type,
    typeInverse: [],
    table: [],
    indices: [],
    entities: [],
    insert: jest.fn(),
    remove: jest.fn(),
  }
})
