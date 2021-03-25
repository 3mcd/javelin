import { Selector } from "../query"

export const query = <S extends Selector>(...selector: S) => {
  return {
    layout: selector.map(c => c.type),
    length: selector.length,
    signature: selector.map(c => c.type).sort((a, b) => a - b),
    filters: {
      not: new Set(),
    },
    *[Symbol.iterator]() {},
    not: jest.fn(),
    forEach: jest.fn(),
    selector,
  }
}
