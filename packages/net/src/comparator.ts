export type CompareFunction<$Value> = (a: $Value, b: $Value) => number

export class Comparator<$Value> {
  compare: CompareFunction<$Value>

  constructor(
    compareFunction: CompareFunction<$Value> = Comparator.defaultCompareFunction,
  ) {
    this.compare = compareFunction
  }

  static defaultCompareFunction(a: unknown, b: unknown) {
    if (a === b) {
      return 0
    }

    return Number(a) < Number(b) ? -1 : 1
  }

  equal(a: $Value, b: $Value) {
    return this.compare(a, b) === 0
  }

  lessThan(a: $Value, b: $Value) {
    return this.compare(a, b) < 0
  }

  greaterThan(a: $Value, b: $Value) {
    return this.compare(a, b) > 0
  }

  lessThanOrEqual(a: $Value, b: $Value) {
    return this.lessThan(a, b) || this.equal(a, b)
  }

  greaterThanOrEqual(a: $Value, b: $Value) {
    return this.greaterThan(a, b) || this.equal(a, b)
  }

  reverse() {
    const compareOriginal = this.compare
    this.compare = (a, b) => compareOriginal(b, a)
  }
}
