+++
title = "Effects"
weight = 5
+++

You'll often need to interact with some asynchronous code, third-party library, or API that doesn't fit into an ECS model. An **effect** is a container for one of these resources.

## Handling Side-Effects

The below example demonstrates a worker effect that might perform some expensive computation in a worker thread and return a result back to the system when finished.

```ts
const physics = () => {
  const { result, doExpensiveComputation } = useWorker()

  if (shouldRun && !result) {
    doExpensiveComputation()
  }

  if (result) {
    // do something with result
  }
}
```

Effects are created using the aptly named `createEffect`. This function accepts a callback as its first argument. The provided callback receives the active `World` as its first parameter, should define any state (variables) used by the effect, and return a function to be executed each tick.

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

Effects have a single rule: they must be called in the same order order and at the same frequency every tick. This means that you shouldn't call effects conditionally (i.e. in a if/else statement or a loop).

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

Effects can exist in either **local mode** or **global mode**. Local effects are scoped to the system in which they were executed. Javelin instantiates one closure per local effect within a system. Global effects are executed a maximum of one time per tick. All calls to global effects refer to the same closure. Local mode is enabled by default.

### Local Effects

Local effects are useful if you want to perform a one-off task, like perform an API request:

```ts
const questUI = () => {
  const context = useCanvas()
  const { done, quests } = useFetch("/quests?complete=false")

  if (done) {
    // render quest log
  }
}
```

Although you should strive to have all game state in components, it can be tedious to create a singleton component each time you need some state within a system. Effects can be used to wrap arbitrary values that persist between ticks.

```ts
const sysFibonacci = () => {
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

### Global Effects

The most common use-case for effects is probably interacting with a third party, like a physics simulation. Effects can also execute queries just like systems, letting you update the external resource when things change within the ECS. Shared effects are a good candidate for encapsulating this type of dependency. They are only executed once per tick and share the same state between systems.

Below is an example of a global effect that instantiates a third party physics simulation, keeps simulation bodies in sync with ECS entities, and steps the simulation in sync with the Javelin world.

```ts
const useSimulation = createEffect(world => {
  const sim = new Library.Simulation()
  return () => {
    queries.attached.forEach(...)  // add new bodies to simulation
    queries.detached.forEach(...)  // remove detached bodies from simulation
    queries.simulated.forEach(...) // copy simulation state to components
    sim.step(world.state.currentTickData) // step simulation in sync with world
    return sim
  }
}, {
  shared: true
});

const jump = () => {
  const { applyImpulse } = useSimulation()
  jumping((e, [body, input]) => {
    applyImpulse(body.simulationId, ...)
  })
}

const move = () => {
  // references the same simulation as in `jump`
  const sim = useSimulation()
  ...
}
```

## Built-in Effects

Some useful effects are included with the core ECS package. A few are outlined below.

<aside>
  <p>
    <strong>Tip</strong> — check the source code of this page to see a few effects in action.
  </p>
</aside>

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

<script>
  const interval = () => {
    const ref = Javelin.useRef(0)
    const log = Javelin.useInterval(4000)

    if (log) {
      console.log("interval", ++ref.value)
    }
  }
  const json = () => {
    // start request after 1s
    const timer = Javelin.useTimer(1000)
    // cancel request after 5s
    const cancel = Javelin.useTimer(5000)
    const request = Javelin.useJson(
      !cancel && timer ? `https://jsonplaceholder.typicode.com/todos/1` : null
    )

    console.log(request)
  }
  const world = Javelin.createWorld({
    systems: [json, interval]
  })

  setInterval(() => {
    world.step()
  }, 2000);
</script>
