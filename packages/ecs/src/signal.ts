import { mutableRemoveUnordered } from "@javelin/core"

export type SignalSubscriber<$Arg1, $Arg2, $Arg3, $Arg4> = $Arg1 extends void
  ? () => void
  : (arg1: $Arg1, arg2: $Arg2, arg3: $Arg3, arg4: $Arg4) => void
export type SignalUnsubscribeCallback = () => void
export type Signal<
  $Arg1 = unknown,
  $Arg2 = unknown,
  $Arg3 = unknown,
  $Arg4 = unknown,
> = {
  subscribe(
    subscriber: SignalSubscriber<$Arg1, $Arg2, $Arg3, $Arg4>,
  ): SignalUnsubscribeCallback
  dispatch(arg1?: $Arg1, arg2?: $Arg2, arg3?: $Arg3, arg4?: $Arg4): void
}

export const createSignal = <
  $Arg1 = void,
  $Arg2 = void,
  $Arg3 = void,
  $Arg4 = void,
>(): Signal<$Arg1, $Arg2, $Arg3, $Arg4> => {
  const subscribers: SignalSubscriber<$Arg1, $Arg2, $Arg3, $Arg4>[] = []
  const subscribe = (
    subscriber: SignalSubscriber<$Arg1, $Arg2, $Arg3, $Arg4>,
  ) => {
    subscribers.push(subscriber)
    return () => mutableRemoveUnordered(subscribers, subscriber)
  }
  const dispatch = (arg1: $Arg1, arg2: $Arg2, arg3: $Arg3, arg4: $Arg4) => {
    for (let i = 0; i < subscribers.length; i++) {
      subscribers[i](arg1, arg2, arg3, arg4)
    }
  }

  return {
    subscribe,
    dispatch,
  }
}
