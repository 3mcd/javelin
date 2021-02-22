export type TypedData = { type: number }
export type ForEachIteratee<T> = (entity: number, data: T) => void
export interface Archetype<T extends TypedData = TypedData> {
  entities: readonly number[]
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

    for (let i = 0; i < data.length; i++) {
      table.push(data[i])
    }

    rowsByEntity[entity] = row
  }

  function remove(entity: number) {
    const row = rowsByEntity[entity]
    const head = entities.pop()!
    const start = rowsByEntity[head] * layoutSize
    const end = start + layoutSize

    if (entity === head) {
      for (let i = 0; i < layoutSize; i++) {
        table.pop()
      }
      return
    }

    entities[row] = head
    rowsByEntity[head] = row
    rowsByEntity[entity] = -1

    for (let i = end; i > start; i--) {
      table[i] = table.pop()!
    }
  }

  function get(entity: number): readonly T[] {
    const row = rowsByEntity[entity]

    if (typeof row !== "number") {
      throw new Error(
        `Entity ${entity} not found in archetype (${layout.toString()}).`,
      )
    }

    const start = rowsByEntity[entity] * layoutSize
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

  return {
    entities,
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
