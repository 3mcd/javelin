# Systems

Systems are functions that modify a world. All game logic is implemented by systems.

An app executes each of it's systems each step. Systems may be optionally configured to run in a specific order through ordering constraints and system groups. They may also be conditionally disabled (and enabled) with run criteria.

Systems are added to an app using the app's `addSystem` method.

```ts
let plantGrowthSystem = (world: j.World) => {
  world.query(Plot).each((plot, plotWater) => {
    world.query(Plant, j.ChildOf(plot)).each((plant, plantMass) => {
      // (grow plant using plotWater)
    })
  })
}

app.addSystem(plantGrowthSystem)
```

By default, an app will execute it's systems in the order they are added.

Systems are removed via the `removeSystem` method.

```ts
app.removeSystem(plantGrowthSystem)
```

## Ordering Constraints

The order in which an app executes systems can be configured using explicit ordering constraints. Ordering constraints are established using a constraint builder object passed to `addSystem`'s optional second callback argument.

```ts
game
  .addSystem(plantGrowthSystem, j.after(weatherSystem))
  .addSystem(weatherSystem)
```

The `after` constraint ensures a system will be run some time following a given system, while `before` ensures a system is executed earlier in the pipeline.

Ordering constraints can be chained.

```ts
app.addSystem(pestSystem, j.after(weatherSystem).before(plantGrowthSystem))
```

## Run Criteria

Systems can also be run conditionally based on the boolean result of a callback function. This predicate function is provided as the third argument to `addSystem`.

```ts
let eachHundredthTick = (world: World) => {
  return world.getResource(Clock).tick % 100 === 0
}

app.addSystem(plantGrowthSystem, j.after(weatherSystem), eachHundredthTick)
```

## System Groups

Systems may be organized into groups. Javelin has six built-in groups:

```ts
enum Group {
  Early,
  EarlyUpdate,
  Update,
  LateUpdate,
  Late,
}
```

Groups are run in the order they appear in the above enum. There are no rules around how built-in groups should be used, but here are some ideas:

1. `Group.Early` can be used for detecting device input, processing incoming network messages, and any additional housekeeping that doesn't touch the primary entities in your world.
2. `Group.EarlyUpdate` might be used for behaviors that have important implications for most entities in your game, like applying player input and updating a physics simulation.
3. `Group.Update` can be used for core game logic, like handling entity collision events, applying damage-over-time effects, spawning entities, etc.
4. `Group.LateUpdate` can be used to spawn and destroy entities because entity operations are [deferred until the end of a step](./entities.md#entity-transaction) anyways.
5. `Group.Late` might be used to render the scene, send outgoing network messages, serialize game state, etc.

Systems are grouped using an app's `addSystemToGroup` method:

```ts
app.addSystemToGroup(j.Group.Late, renderPlotSystem)
```

Like `addSystem`, `addSystemToGroup` also accepts ordering constraints and run criteria through it's third and fourth arguments.

```ts
app.addSystemToGroup(j.Group.Late, renderPlotSystem, _ =>
  _.before(renderGrassSystem),
)
```

Custom system groups can be created with an app's `addGroup` method:

```ts
app.addGroup("plot_sim")
```

Like systems, system groups can be ordered and toggled using ordering constraints and run criteria, respectively.

```ts
app.addGroup(
  "plot_sim",
  j.before(j.Group.LateUpdate).after(j.Group.Update),
  eachHundredthTick,
```

## Initialization Systems

Javelin has a sixth built-in system group: `Group.Init`. This group has run criteria and ordering constraints that ensure it is executed only once at the beginning of the app's first step. `Group.Init` is useful when performing one-off initialization logic, like loading a map or spawning a player.

Apps have a small convenience method for adding systems to `Group.Init`: `addInitSystem`.

```ts
app.addInitSystem(loadLevelSystem)
```

Of course, like each of the aformentioned system-related methods, `addInitSystem` also accepts ordering constraints and run criteria.
