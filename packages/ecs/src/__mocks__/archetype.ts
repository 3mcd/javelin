import { Archetype } from "../archetype"
import { ComponentState } from "@javelin/ecs"

export const createArchetype = jest.fn(
  (layout: number[]): Archetype => {
    return {
      layout,
      layoutInverse: [0],
      table: layout.map(() => [{ tid: 0, cst: ComponentState.Initialized }]),
      indices: [0],
      entities: [0],
      insert: jest.fn(),
      remove: jest.fn(),
    }
  },
)
