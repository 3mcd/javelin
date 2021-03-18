import { Archetype } from "../archetype"

export const createArchetype = jest.fn(
  ({ signature }): Archetype => {
    return {
      signature,
      signatureInverse: [0],
      table: signature.map(() => [{ _tid: 0 }]),
      indices: [0],
      entities: [0],
      insert: jest.fn(),
      remove: jest.fn(),
    }
  },
)
