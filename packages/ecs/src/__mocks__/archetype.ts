import { Archetype } from "../archetype"

export const createArchetype = jest.fn(
  (layout: number[]): Archetype => {
    return {
      layout,
      table: layout.map(() => [{ type: 0 }]),
      indices: [0],
      entities: [0],
      insert: jest.fn(),
      remove: jest.fn(),
    }
  },
)
