import { mutableRemoveUnordered } from "./util/array"

export type SignalSubscriber<T> = T extends void ? () => void : (t: T) => void
export type SignalUnsubscribeCallback = () => void
export type Signal<T = void> = {
  subscribe(subscriber: SignalSubscriber<T>): SignalUnsubscribeCallback
  dispatch(t: T): void
}

export const createSignal = <T>(): Signal<T> => {
  const subscribers: SignalSubscriber<T>[] = []
  const subscribe = (subscriber: SignalSubscriber<T>) => {
    subscribers.push(subscriber)
    return () => mutableRemoveUnordered(subscribers, subscriber)
  }
  const dispatch = (t: T) => {
    for (let i = 0; i < subscribers.length; i++) {
      subscribers[i](t)
    }
  }

  return {
    subscribe,
    dispatch,
  }
}
