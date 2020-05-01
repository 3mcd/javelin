import { Filter } from "../query"
import { Storage } from "../storage"

export function createTagFilter(tag: number, has = true): Filter {
  const matchEntity = has
    ? (entity: number, storage: Storage) => storage.hasTag(entity, tag)
    : (entity: number, storage: Storage) => !storage.hasTag(entity, tag)

  function matchComponent() {
    return true
  }

  return { matchEntity, matchComponent }
}
