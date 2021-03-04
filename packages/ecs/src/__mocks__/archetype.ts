import { Archetype } from "../archetype"
import { ComponentState } from "@javelin/ecs"

export const createArchetype = jest.fn(
  ({ layout }): Archetype => {
    return {
      layout,
      layoutInverse: [0],
      table: layout.map(() => [{ _tid: 0, _cst: ComponentState.Attached }]),
      indices: [0],
      entities: [0],
      insert: jest.fn(),
      remove: jest.fn(),
    }
  },
)
