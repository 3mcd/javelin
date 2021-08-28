+++
title = "Effects"
weight = 5
+++

You'll often need to interact with some asynchronous code, third-party library, or API that doesn't fit into a pure ECS model. An **effect** is a container for one of these resources.

## Handling Side-Effects

Below is an example of a ficticious effect that performs some expensive computation in a worker thread and returns a result back to the system when finished.

```ts
const physics = () => {
  const { result, run } = useWorker()

  if (!result) {
    run()
  } else {
    // do something with result
  }
}
```

Effects are created using the aptly named `createEffect`. This function accepts a factory function as its first argument. This function receives a world as its first parameter. It should define any state (variables) used by the effect, and return a function to be executed each tick.

Below is an effect that will return `false` until the provided duration passes:

```ts
import { createEffect } from "@javelin/ecs"

const useTimer = createEffect(world => {
  // effect closure (state)
  let state = 0
  // effect executor (callback)
  return (duration: number) => {
    if (state === 0) {
      state = 1
      setTimeout(() => (state = 2), duration)
    }
    return state === 2
  }
})
```

<aside>
  <p>
    <strong>Tip</strong> — effects in Javelin have some similarities to React effects. They are executed each update (tick) and  read/modify closed-over variables.
  </p>
</aside>

Effects have a single rule: they must be called in the same order order and at the same frequency every tick. This means that you shouldn't call effects variably (i.e. in a if/else statement or a loop).

By default, Javelin will create a copy of the effect closure for each effect call. This lets you use multiple effects of the same type without conflict. Take the example below, where both timers run alongside eachother, with the second timer finishing one second after the first.

```ts
const sysA = () => {
  if (useTimer(1000)) console.log("a")
  if (useTimer(2000)) console.log("b")
}
```

```
(1000ms)
> "a"
(1000ms)
> "b"
```

## Effect Modes

Effects can exist in either **local mode** or **shared mode**. Local effects are scoped to the system in which they were executed. Javelin instantiates one closure per local effect within a system. Shared effects are executed a maximum of one time per tick. All calls to shared effects refer to the same closure. Effects are local by default.

### Local Effects

Local effects are useful if you want to perform an isolated task, like perform an API request:

```ts
const renderQuests = () => {
  const context = useCanvas()
  const { done, quests } = useFetch("/quests?complete=false")

  if (done) {
    drawQuestLog(quests)
  }
}
```

Although you should strive to have all game state in components, it can be tedious to create a singleton component each time you need some state within a system. Effects can be used to wrap arbitrary values that persist between ticks.

```ts
const fibonacci = () => {
  const a = useRef(0)
  const b = useRef(1)
  const bPrev = b.value

  b.value += a.value
  a.value = bPrev

  console.log(a.value)
}
```

<aside>
  <p>
    <strong>Tip</strong> — using effects to store system state may bother the ECS purist, but it's undeniably convenient and practical, especially for simple cases where state wouldn't need to be serialized or shared with another system.
  </p>
</aside>

### Shared Effects

Effects can also execute queries just like systems, letting you update the external resource when things change within the ECS. Shared effects are a good candidate for encapsulating this type of dependency. They are only executed once per tick and share the same state between systems.

Below is an example of a shared effect that instantiates a third party physics simulation, keeps simulation bodies in sync with ECS entities, and steps the simulation in sync with the Javelin world.

```ts
const useSimulation = createEffect(world => {
  const simulation = new Library.Simulation()
  return () => {
    useMonitor(bodies, ...) // maintain simulation bodies
    bodies(...) // copy simulation state to components
    simulation.step(world.latestTickData) // step simulation in sync with world
    return simulation
  }
}, { shared: true });

const jump = () => {
  const simulation = useSimulation()
  jumping((e, [body, input]) =>
    simulation.applyImpulse(body.simulationId, ...)
  )
}

const move = () => {
  // references the same simulation as in `jump`
  const simulation = useSimulation()
}
```

## Built-in Effects

Some useful effects are included with the core ECS package. A few are outlined below.

### `useRef<T>(initialValue: T): { value: T }`

`useRef` returns a mutable value that persists between ticks.

The following example demonstrates a ref which stores the radius of the largest organism in a game. This value is persisted through ticks, so it ultimately references the radius of the largest organism queried across **all ticks**, not just the current tick.

```ts
const biggest = useRef<number | null>(null)

organisms((entity, [circle]) => {
  if (circle.radius > biggest.value) {
    biggest.value = circle.radius
  }
})
```

### `useInterval(duration: number): boolean`

The `useInterval` effect returns `false` until the specified duration passes, at which point it will begin returning `true`. It will then immediately flip back to false until the duration passes again.

You could use `useInterval` to write a system that sends user input to a server at regular intervals:

```ts
const send = useInterval(INPUT_SEND_FREQUENCY)
...
if (send) {
  channel.send(input)
}
```

### `useJson<T>(path: string | null, options: FetchDict, invalidate: boolean): RequestState<T>`

The `useJson` effect initiates an HTTP request and returns an object that describes the state of the request. Passing a `null` URL will cancel any ongoing requests.

```ts
const { done, response, error } = useJson(
  player.value
    ? `/players/${player.value.id}/inbox`
    : null
)

if (done) {
  for (const message of response) {
    draw(...)
  }
}
```
