import { Collection, CollectionIteratee, CollectionRecord } from "../types"

export const each = <R extends CollectionRecord, I = R>(
  collection: Collection<R, I>,
  iteratee: CollectionIteratee<R>,
) => collection.forEach(iteratee)
