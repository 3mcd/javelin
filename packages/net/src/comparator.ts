export type CompareFunction<T> = (a: T, b: T) => number

export class Comparator<T> {
  compare: CompareFunction<T>

  constructor(
    compareFunction: CompareFunction<T> = Comparator.defaultCompareFunction,
  ) {
    this.compare = compareFunction
  }

  static defaultCompareFunction(a: unknown, b: unknown) {
    if (a === b) {
      return 0
    }

    return Number(a) < Number(b) ? -1 : 1
  }

  equal(a: T, b: T) {
    return this.compare(a, b) === 0
  }

  lessThan(a: T, b: T) {
    return this.compare(a, b) < 0
  }

  greaterThan(a: T, b: T) {
    return this.compare(a, b) > 0
  }

  lessThanOrEqual(a: T, b: T) {
    return this.lessThan(a, b) || this.equal(a, b)
  }

  greaterThanOrEqual(a: T, b: T) {
    return this.greaterThan(a, b) || this.equal(a, b)
  }

  reverse() {
    const compareOriginal = this.compare
    this.compare = (a, b) => compareOriginal(b, a)
  }
}
