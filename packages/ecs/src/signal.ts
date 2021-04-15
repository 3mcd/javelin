import { mutableRemoveUnordered } from "@javelin/model"

export type SignalSubscriber<T, T2, T3> = T extends void
  ? () => void
  : (t: T, t2: T2, t3: T3) => void
export type SignalUnsubscribeCallback = () => void
export type Signal<T = unknown, T2 = unknown, T3 = unknown> = {
  subscribe(subscriber: SignalSubscriber<T, T2, T3>): SignalUnsubscribeCallback
  dispatch(t?: T, t2?: T2, t3?: T3): void
}

export const createSignal = <T = void, T2 = void, T3 = void>(): Signal<
  T,
  T2,
  T3
> => {
  const subscribers: SignalSubscriber<T, T2, T3>[] = []
  const subscribe = (subscriber: SignalSubscriber<T, T2, T3>) => {
    subscribers.push(subscriber)
    return () => mutableRemoveUnordered(subscribers, subscriber)
  }
  const dispatch = (t: T, t2: T2, t3: T3) => {
    for (let i = 0; i < subscribers.length; i++) {
      subscribers[i](t, t2, t3)
    }
  }

  return {
    subscribe,
    dispatch,
  }
}
