export type SignalListener<T> = (event: T) => void
export type ReadonlySignal<T> = Omit<Signal<T>, "dispatch">

export class Signal<T> {
  #listener

  constructor() {
    this.#listener = [] as SignalListener<T>[]
  }

  add(listener: SignalListener<T>) {
    let listener_index = this.#listener.push(listener) - 1
    return () => {
      this.#listener.splice(listener_index, 1)
    }
  }

  emit(event: T) {
    for (let i = this.#listener.length - 1; i >= 0; i--) {
      let listener = this.#listener[i]
      listener(event)
    }
  }
}
