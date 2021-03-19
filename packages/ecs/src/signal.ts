import { mutableRemoveUnordered } from "./util/array"

export type SignalSubscriber<T, T2> = T extends void
  ? () => void
  : (t: T, t2: T2) => void
export type SignalUnsubscribeCallback = () => void
export type Signal<T = unknown, T2 = unknown> = {
  subscribe(subscriber: SignalSubscriber<T, T2>): SignalUnsubscribeCallback
  dispatch(t?: T, t2?: T2): void
}

export const createSignal = <T = void, T2 = void>(): Signal<T, T2> => {
  const subscribers: SignalSubscriber<T, T2>[] = []
  const subscribe = (subscriber: SignalSubscriber<T, T2>) => {
    subscribers.push(subscriber)
    return () => mutableRemoveUnordered(subscribers, subscriber)
  }
  const dispatch = (t: T, t2: T2) => {
    for (let i = 0; i < subscribers.length; i++) {
      subscribers[i](t, t2)
    }
  }

  return {
    subscribe,
    dispatch,
  }
}
