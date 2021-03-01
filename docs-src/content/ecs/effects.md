+++
title = "Effects"
weight = 6
+++

## Interacting with dependencies

You'll often need to interact with some asynchronous code, third-party library, or API that wouldn't fit cleanly into Javelin's synchronous/serializable model. An **effect** is a container for one of these resources.

The below example demonstrates a worker effect that might perform some expensive computation in a worker thread and return a result back to the system when finished.

 ```ts
 const sys_physics = () => {
   const { result, doExpensiveComputation } = workerEffect()

   if (!result) {
    doExpensiveComputation()
   } else {
     // do something with result
   }
 }
 ```

 Javelin exports a function `createEffect` which accepts a callback as its first argument. This callback is should define any state (variables) used by the effect, and return a function to be executed each tick.

Below is an effect that will return `false` until the provided duration passes:

```ts
import { createEffect } from "@javelin/ecs"

const timer = createEffect(() => {
  // effect state
  let state = 0
  // effect function
  return (world, duration: number) => {
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
    <strong>Note</strong> — effects in Javelin have some similarities to React effects. They are executed each update (tick) and  read/modify closed-over variables. In a way, Javelin's effects are a combination of React's <code>useEffect</code> and <code>useRef</code>.
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

## Effect modes

Effects can exist in one of two modes: **local** or **global**. Local effects are scoped to the system in which they were executed. Javelin instantiates one closure and one callback function per local effect within a system. Global effects are executed a maximum of one time per tick. All calls to global effects refer to the same closure and callback. Local mode is enabled by default.

### Local effects

Local effects are useful if you want to perform a one-off task, like perform an API request:

```ts
const sys_quest_ui = () => {
  const context = canvasEffect()
  const { done, quests } = fetchEffect("/quests?complete=false")

  if (done) {
    // render quest log
  }
}
```

Although you should strive to have all game state in components, it can be tedious to create a singleton component each time you need some state within a system. Effects can be used to wrap arbitrary values that persist between ticks.

```ts
const sys_fibonacci = () => {
  const a = refEffect(0)
  const b = refEffect(1)
  const bPrev = b.value

  b.value += a.value
  a.value = bPrev

  console.log(a.value)
}
```

<aside>
  <p>
    <strong>Note</strong> — using effects to store system state may bother the ECS purist, but it's undeniably convenient and practical, especially for simple cases where state wouldn't need to be serialized or shared with another system.
  </p>
</aside>

### Global effects

The most common use-case for effects is probably interacting with a third party, like a physics simulation. Effects can also execute queries just like systems, letting you update the external resource when things change within the ECS.

Below is an example of a global effect that instantiates a third party physics simulation, keeps simulation bodies in sync with ECS entities, and steps the simulation in sync with the Javelin world.

```ts
const simulationEffect = createEffect(() => {
  const simulation = new Library.Simulation()
  return world => {
    // add new bodies to physics simulation
    for (const [e] of queries.attached) ...
    // remove detached bodies from physics simulation
    for (const [e] of queries.detached) ...
    // copy simulation state to ECS state
    for (const [e] of queries.simulated) ...
    // step simulation in sync with world
    simulation.step(world.state.currentTickData)
    return simulation
  }
}, {
  global: true
});

const sys_jump = () => {
  const simulation = simulationEffect()

  for (const [e, body, input] of queries.jumping) {
    simulation.applyImpulse(body.simulationId, ...)
  }
}

const sys_move = () => {
  // references the same simulation as in sys_jump
  const simulation = simulationEffect()
  ...
}
```

Inspect this page's source to see some example effects in action.

<script>
  const effects = {
    ref: Javelin.createEffect(() => {
      let initial = true
      const state = {}
      return (world, initialValue) => {
        if (initial) {
          state.value = initialValue
        }
        initial = false
        return state
      }
    }),
    wait: Javelin.createEffect(() => {
      return (world, duration) => {
        const state = effects.ref(0)
        if (state.value === 0) {
          state.value = 1
          setTimeout(() => (state.value = 2), duration)
        }
        return state.value === 2
      }
    }),
    fetch: Javelin.createEffect(() => {
      let state = 0;
      let result = null;
      return (world, url, invalidate = false) => {
        if (invalidate) {
          state = 0
        }
        if (state === 1) {
          return result
        }
        return fetch(url).then(response => response.json()).then(r => {
          result = r;
          state = 1;
        })
      }
    })
  }
  const system_a = () => {
    const doneA = effects.wait(1000)
    const doneB = effects.wait(3000)
    const runningA = effects.ref(true)
    const runningB = effects.ref(true)

    if (doneA && runningA.value) {
      console.log("a")
      runningA.value = false
    }

    if (doneB && runningB.value) {
      console.log("b")
      runningB.value = false
    }
  }
  const system_b = () => {
    const running = effects.ref(true)
    const response = effects.fetch("https://jsonplaceholder.typicode.com/todos/1")

    if (response && running.value) {
      console.log(response)
      running.value = false
    }
  }
  const sys_fibonacci = () => {
    const a = effects.ref(0)
    const b = effects.ref(1)
    const x = b.value

    if (x < 10000) {
      b.value += a.value
      a.value = x

      console.log(a.value)
    }
  }

  const world = Javelin.createWorld({
    systems: [
      system_a,
      system_b,
      sys_fibonacci
    ]
  })

  setInterval(world.tick, 500)
</script>