# Monitors

Some systems must be notified of entities that match or no longer match a set of query terms. This is necessary when implementing side-effects like spawning new entities when other entities are created or destroyed, updating a third-party library, or displaying information in a UI.

Systems can react to changes in entity composition using monitors. Below a simple system that utilizes monitors to log all created and deleted entities:

```ts
function log_entity_system(world: World) {
  world.monitor()
    .each_included(entity => {
      console.log("created", entity)
    })
    .each_excluded(entity => {
      console.log("deleted", entity)
    })
}
```

The entities a monitor recieves can be narrowed using query terms.

```ts
world.monitor(Client)
  .each_included((client, client_socket) => {
    client_socket.send("ping")
  })
```

In plain terms, monitors execute the callback provided to `each_included` for each entity that began to match the provided query terms at the end of the last step. It executes the `each_excluded` callback for entities that no longer match the terms. They can be used to:

- mutate the world in response to entity changes
- update list or aggregate views in a UI
- broadcast events to a third-party library, service, or client

## Data Transience

Because [entity operations are deferred](./entities.md#transactions) to the end of a step, component values are no longer available to a system by the time a monitor executes it's `each_excluded` callback.

If you wish to access component values of an entity that no longer matches a monitor's terms, you can use a world's `monitor_immediate` method. `monitor_immediate` returns a monitor that is configured to run within the current step.

```ts
world.monitor_immediate(Enemy)
  .each_excluded((enemy, enemy_pos) => {
    world.create(LootBag, enemy_pos, ...)
  })
```

An immediate monitor must be executed downstream of its causal systems in the app's system execution pipeline. In the above example, the system should be configured using [ordering constraints](./systems.md#ordering-constraints) to occur _after_ the system that deletes `Enemy` entities.
