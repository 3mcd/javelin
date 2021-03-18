+++
title = "Effects"
weight = 6
+++

You'll often need to interact with some asynchronous code, third-party library, or API that wouldn't fit cleanly into Javelin's synchronous/serializable model. An **effect** is a container for one of these resources.
## Handling Side-Effects

The below example demonstrates a worker effect that might perform some expensive computation in a worker thread and return a result back to the system when finished.

 ```ts
 const sys_physics = () => {
   const { result, doExpensiveComputation } = effects.worker()

   if (!result) {
    doExpensiveComputation()
   } else {
     // do something with result
   }
 }
 ```

 Javelin exports a function `createEffect` which accepts a callback as its first argument. This callback receives the active `World` as its first parameter, should define any state (variables) used by the effect, and return a function to be executed each tick.

Below is an effect that will return `false` until the provided duration passes:

```ts
import { createEffect } from "@javelin/ecs"

const timer = createEffect(world => {
  // effect state
  let state = 0
  // effect function
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
const sys_a = () => {
  if (timer(1000)) console.log("a")
  if (timer(2000)) console.log("b")
}

(1000ms)
> "a"
(1000ms)
> "b"
```

## Effect Modes

Effects can exist in either **local mode** or **global mode**. Local effects are scoped to the system in which they were executed. Javelin instantiates one closure and one callback function per local effect within a system. Global effects are executed a maximum of one time per tick. All calls to global effects refer to the same closure and callback. Local mode is enabled by default.

### Local Effects

Local effects are useful if you want to perform a one-off task, like perform an API request:

```ts
const sys_quest_ui = () => {
  const context = effects.canvas()
  const { done, quests } = fetchEffect("/quests?complete=false")

  if (done) {
    // render quest log
  }
}
```

Although you should strive to have all game state in components, it can be tedious to create a singleton component each time you need some state within a system. Effects can be used to wrap arbitrary values that persist between ticks.

```ts
const sys_fibonacci = () => {
  const a = effects.ref(0)
  const b = effects.ref(1)
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

The most common use-case for effects is probably interacting with a third party, like a physics simulation. Effects can also execute queries just like systems, letting you update the external resource when things change within the ECS.

Below is an example of a global effect that instantiates a third party physics simulation, keeps simulation bodies in sync with ECS entities, and steps the simulation in sync with the Javelin world.

```ts
const simulation = createEffect(world => {
  const sim = new Library.Simulation()
  return () => {
    queries.attached.forEach(...)  // add new bodies to simulation   
    queries.detached.forEach(...)  // remove detached bodies from simulation
    queries.simulated.forEach(...) // copy simulation state to components
    sim.step(world.state.currentTickData) // step simulation in sync with world
    return sim
  }
}, {
  global: true
});

const sys_jump = () => {
  const simulation = simulationEffect()
  queries.jumping.forEach((e, [body, input]) => {
    simulation.applyImpulse(body.simulationId, ...)
  })
}

const sys_move = () => {
  // references the same simulation as in sys_jump
  const simulation = simulationEffect()
  ...
}
```

## Built-ins

Some useful effects are included with the core ECS package. A few are outlined below.

<aside>
  <p>
    <strong>Tip</strong> — check the source code of this page to see a few effects in action.
  </p>
</aside>

### `ref<T>(initialValue: T): { value: T }`

A ref is a mutable value that persists between ticks.

The following example demonstrates a ref which stores the radius of the largest organism in a game. This value is persisted through ticks, so it ultimately references the radius of the largest organism queried across **all ticks**, not just the current tick. 
```ts
const biggest = ref<number | null>(null)

organisms.forEach((entity, [circle]) => {
  if (circle.radius > biggest.value) {
    biggest.value = circle.radius
  }
})
```

### `interval(duration: number): boolean`

The interval effect returns `false` until the specified duration passes, at which point it will begin returning `true`. It will then immediately flip back to false until the duration passes again.

You could use `interval` to write a system that sends user input to a server at regular intervals:

```ts
const send = interval(INPUT_SEND_FREQUENCY)
...
if (send) {
  channel.send(input)
}
```

### `json<T>(path: string | null, options: FetchDict, invalidate: boolean): RequestState<T>`

The json effect initiates an HTTP request and returns an object that describes the state of the request. Passing a `null` URL will cancel any ongoing requests.

```ts
const { done, response, error } = json(
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
  const sys_interval = () => {
    const ref = Javelin.ref(0)
    const log = Javelin.interval(4000)

    if (log) {
      console.log("interval", ++ref.value)
    }
  }
  const sys_json = () => {
    // start request after 1s
    const timer = Javelin.timer(1000)
    // cancel request after 5s
    const cancel = Javelin.timer(5000)
    const request = Javelin.json(
      !cancel && timer ? `https://jsonplaceholder.typicode.com/todos/1` : null
    )

    console.log(request)
  }
  const world = Javelin.createWorld({
    systems: [sys_json, sys_interval]
  })

  setInterval(() => {
    world.tick()
  }, 2000);
</script>