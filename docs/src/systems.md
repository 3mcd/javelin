# Systems

Systems are functions that modify a world. All game logic is implemented by systems.

An app executes each of it's systems each step. Systems may be optionally configured to run in a specific order through ordering constraints and system groups. They may also be conditionally disabled (and enabled) with run criteria.

Systems are added to an app using the app's `add_system` method.

```ts
function plant_growth_system(world: World) {
  world.of(Plot).each((plot, plot_water) => {
    world.of(Plant, ChildOf(plot)).each((plant, plant_mass) => {
      // (grow plant using plot_water)
    })
  })
}

game.add_system(plant_growth_system)
```

By default, an app will execute it's systems in the order they are added.

## Ordering Constraints

The order in which an app executes systems can be configured using explicit ordering constraints. Ordering constraints are established using a constraint builder object passed to `add_system`'s optional second callback argument.

```ts
game
  .add_system(plant_growth_system, _ => _.after(weather_system))
  .add_system(weather_system)
```

The `after` constraint ensures a system will be run some time following a given system, while `before` ensures a system is executed earlier in the pipeline.

Ordering constraints can be chained.

```ts
game.add_system(
  pest_system,
  _ => _.after(weather_system).before(plant_growth_system),
)
```

## Run Criteria

Systems can also be run conditionally based on the boolean result of a callback function. This predicate function is provided as the third argument to `add_system`.

```ts
function each_hundredth_tick(world: World) {
  return world.get_resource(Clock).tick % 100 === 0
}

game.add_system(
  plant_growth_system,
  _ => _.after(weather_system),
  each_hundredth_tick,
)
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

1. `Group.Early` can be used for detecting device input, processing incoming network messages, and any additional housekeeping that doesn't touch the primary entities in your game.
2. `Group.EarlyUpdate` might be used for behaviors that have important implications for most entities in your game, like applying player input and updating a physics simulation.
3. `Group.Update` can be used for core game logic, like handling entity collision events, applying damage-over-time effects, spawning entities, etc.
4. `Group.LateUpdate` can be used to spawn and destroy entities because entity operations are [deferred until the end of a step](./entities.md#transactions) anyways.
5. `Group.Late` might be used to render the scene, send outgoing network messages, serialize game state, etc.

Systems are grouped using an app's `add_system_to_group` method:

```ts
game.add_system_to_group(Group.Late, render_plot_system)
```

Like `add_system`, `add_system_to_group` also accepts ordering constraints and run criteria through it's third and fourth arguments.

```ts
game.add_system_to_group(
  Group.Late,
  render_plot_system, 
  _ => _.before(render_grass_system),
)
```

Custom system groups can be created with an app's `add_group` method:

```ts
app.add_group("plot_sim")
```

Like systems, system groups can be ordered and toggled using ordering constraints and run criteria, respectively.

```ts
game.add_group(
  "plot_sim",
  _ => _.before(Group.LateUpdate).after(Group.Update),
  each_hundredth_tick,
```



## Initialization Systems

Javelin has a sixth built-in system group: `Group.Init`. This group has run criteria and ordering constraints that ensure it is executed only once at the beginning of the app's first step. `Group.Init` is useful when performing one-off initialization logic, like loading a map or spawning a player.

Apps have a small convenience method for adding systems to `Group.Init`: `add_init_system`.

```ts
game.add_init_system(load_level_system)
```

Of course, like each of the aformentioned system-related methods, `add_init_system` also accepts ordering constraints and run criteria.
