import { mutableEmpty } from "@javelin/core"

export type Topic<D = unknown> = {
  /**
   * Provides iterator syntax to the consumers of a topic. This will loop
   * through all of the events with the type specified in the second type
   * parameter.
   */
  [Symbol.iterator](): IterableIterator<D>

  /**
   * Pushes an event to the topic so that it can be consumed by downstream
   * systems after the next call to flush().
   * @param event Event data
   */
  push(event: D): void

  /**
   * Pushes an event to be consumed immediately.
   * @param event Event data
   */
  pushImmediate(event: D): void

  /**
   * Utility method that cleans the event list in the topic such that at the
   * end of the tick (or after all the systems have consumed whatever events
   * they are interested in we can flush out events that have already been
   * consumed.)
   */
  flush(): void

  /**
   * Clear all messages from the queue (both staged and ready).
   */
  clear(): void
}

/**
 * The utility method used to create a topic, consumes a type parameter
 * and a name and returns an object that conforms to the topic type
 */
export const createTopic = <E = unknown>(): Topic<E> => {
  const staged: E[] = []
  const ready: E[] = []
  const push = (event: E) => staged.push(event)
  const pushImmediate = (event: E) => ready.push(event)
  const flush = () => {
    mutableEmpty(ready)
    const len = staged.length
    for (let i = len - 1; i >= 0; i--) {
      ready[i] = staged.pop()!
    }
  }
  const clear = () => {
    mutableEmpty(staged)
    mutableEmpty(ready)
  }

  return {
    *[Symbol.iterator]() {
      for (let i = 0; i < ready.length; i++) {
        yield ready[i]
      }
    },
    push,
    pushImmediate,
    flush,
    clear,
  }
}
