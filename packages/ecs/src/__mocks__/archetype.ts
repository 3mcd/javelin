import { Archetype } from "../archetype"

export const createArchetype = jest.fn(
  (layout: number[]): Archetype => {
    return {
      layout,
      table: layout.map(i => ({ type: i })),
      entities: [0],
      insert: jest.fn(),
      remove: jest.fn(),
      forEach: jest.fn(),
      get: jest.fn(() => []),
      getByType: jest.fn(),
      has: jest.fn(),
      indexByType: layout.reduce((a, x, i) => {
        a[x] = i
        return a
      }, [] as number[]),
      layoutSize: 1,
    }
  },
)
