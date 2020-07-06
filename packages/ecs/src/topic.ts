import { mutableEmpty } from "./util/array"

export type Topic<D = unknown> = {
  /**
   * Provides iterator syntax to the consumers of a topic. This will loop
   * through all of the events with the type specified in the second type
   * parameter.
   */
  [Symbol.iterator](): IterableIterator<D>

  /**
   * Pushes an event to the topic so that it can be consumed by downstream
   * systems.
   */
  push(event: D): void

  /**
   * Utility method that cleans the event list in the topic such that at the
   * end of the tick (or after all the systems have consumed whatever events
   * they are interested in we can flush out events that have already been
   * consumed.)
   */
  flush(): void
}

/**
 * The utility method used to create a topic, consumes a type parameter
 * and a name and returns an object that conforms to the topic type
 */
export const createTopic = <E = unknown>(): Topic<E> => {
  const staged: E[] = []
  const ready: E[] = []
  const push = (event: E) => staged.push(event)
  const flush = () => {
    mutableEmpty(ready)
    const len = staged.length
    for (let i = len - 1; i >= 0; i--) {
      ready[i] = staged.pop()!
    }
  }

  return {
    *[Symbol.iterator]() {
      for (let i = 0; i < ready.length; i++) {
        yield ready[i]
      }
    },
    push,
    flush,
  }
}
