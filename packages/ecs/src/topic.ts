import { mutableEmpty } from "@javelin/core"

export type Topic<D = unknown> = {
  /**
   * Provides iterator syntax to the consumers of a topic.
   */
  [Symbol.iterator](): IterableIterator<D>

  /**
   * Pushes an event to the topic so that it can be consumed by downstream
   * systems after the next call to flush().
   * @param event Event data
   */
  push(event: D): void

  /**
   * Push an event to be consumed immediately.
   * @param event Event data
   */
  pushImmediate(event: D): void

  /**
   * Transition all staged events to be consumed on the next iteration.
   */
  flush(): void

  /**
   * Clear all events from the queue (both staged and ready).
   */
  clear(): void
}

/**
 * Create a topic.
 */
export const createTopic = <$Event = unknown>(): Topic<$Event> => {
  const staged: $Event[] = []
  const ready: $Event[] = []
  const push = (event: $Event) => staged.push(event)
  const pushImmediate = (event: $Event) => ready.push(event)
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
