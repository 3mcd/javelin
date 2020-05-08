import { Archetype } from "../archetype"

export const createArchetype = jest.fn(
  (layout: number[]): Archetype => {
    return {
      layout,
      table: [],
      indices: [],
      entities: [],
      insert: jest.fn(),
      remove: jest.fn(),
    }
  },
)
