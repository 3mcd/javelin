import { Archetype } from "../archetype"

export const createArchetype = jest.fn(({ signature }): Archetype => {
  return {
    signature,
    signatureInverse: [],
    table: [],
    indices: [],
    entities: [],
    insert: jest.fn(),
    remove: jest.fn(),
  }
})
