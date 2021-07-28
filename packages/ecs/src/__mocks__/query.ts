import { UNSAFE_internals } from "../internal"
import { Selector } from "../query"

export const query = <S extends Selector>(...selector: S) => {
  return {
    layout: selector.map(c => UNSAFE_internals.schemaIndex.get(c)),
    length: selector.length,
    type: selector
      .map(c => UNSAFE_internals.schemaIndex.get(c)!)
      .sort((a, b) => a - b),
    filters: {
      not: new Set(),
    },
    *[Symbol.iterator]() {},
    not: jest.fn(),
    forEach: jest.fn(),
    selector,
  }
}
