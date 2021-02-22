export type TypedData = { type: number }
export type ForEachIteratee<T> = (entity: number, data: T) => void

export interface Archetype<T extends TypedData = TypedData> {
  entities: readonly number[]
  forEach(iteratee: ForEachIteratee<T[]>): void
  get(entity: number): readonly T[]
  getByType(entity: number, type: number): T
  has(entity: number): boolean
  indexByType: readonly number[]
  insert(entity: number, data: T[]): void
  layout: readonly number[]
  layoutSize: number
  remove(entity: number): void
  table: readonly T[]
}

export function createArchetype<T extends TypedData>(
  layout: number[],
): Archetype<T> {
  const table: T[] = []
  const entities: number[] = []
  const rowsByEntity: number[] = []
  const layoutSize = layout.length
  const indexByType = layout.reduce((a, x, i) => {
    a[x] = i
    return a
  }, [] as number[])

  function insert(entity: number, data: T[]) {
    const row = entities.push(entity) - 1
    const length = table.length

    for (let i = 0; i < data.length; i++) {
      const value = data[i]
      table[length + indexByType[value.type]] = value
    }

    rowsByEntity[entity] = row
  }

  function remove(entity: number) {
    const row = rowsByEntity[entity]

    if (row === entities.length - 1) {
      entities.pop()
      for (let i = 0; i < layoutSize; i++) {
        table.pop()
      }
      return
    }

    const head = entities.pop()!
    const start = rowsByEntity[entity] * layoutSize
    const end = start + layoutSize

    for (let i = end - 1; i >= start; i--) {
      table[i] = table.pop()!
    }

    entities[row] = head
    rowsByEntity[head] = row
    delete rowsByEntity[entity]
  }

  function get(entity: number): readonly T[] {
    const row = rowsByEntity[entity]

    if (typeof row !== "number") {
      throw new Error(
        `Entity ${entity} not found in archetype (${layout.toString()}).`,
      )
    }

    const start = row * layoutSize
    const end = start + layoutSize
    const result: T[] = []

    for (let i = start; i < end; i++) {
      result.push(table[i])
    }

    return result
  }

  function getByType(entity: number, type: number): T {
    const row = rowsByEntity[entity]

    if (typeof row !== "number") {
      throw new Error(
        `Entity ${entity} not found in archetype (${layout.toString()}).`,
      )
    }

    return table[rowsByEntity[entity] * layoutSize + indexByType[type]]
  }

  function has(entity: number) {
    return rowsByEntity[entity] !== undefined
  }

  const tmpForEachData: T[] = []

  function forEach(iteratee: ForEachIteratee<T[]>) {
    for (let i = 0; i < entities.length; i++) {
      const start = i * layoutSize
      for (let j = 0; j < layoutSize; j++) {
        tmpForEachData[j] = table[start + j]
      }
      iteratee(entities[i], tmpForEachData)
    }
  }

  return {
    entities,
    forEach,
    get,
    getByType,
    has,
    indexByType,
    insert,
    layout,
    layoutSize,
    remove,
    table,
  }
}
