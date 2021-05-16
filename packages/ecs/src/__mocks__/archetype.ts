import { Archetype } from "../archetype"
import { createSignal } from "../signal"

export const createArchetype = jest.fn(
  ({ signature }): Archetype => {
    return {
      signature,
      signatureInverse: [],
      table: [],
      indices: [],
      entities: [],
      insert: jest.fn(),
      remove: jest.fn(),
      inserted: createSignal(),
      removed: createSignal(),
    }
  },
)
