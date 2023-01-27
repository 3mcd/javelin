# Monitors

Some systems must be notified of entities that match or no longer match a set of query terms. This is necessary when implementing side-effects like spawning new entities when other entities are created or destroyed, updating a third-party library, or displaying information in a UI.

Systems can react to changes in entity composition using monitors. Below a simple system that utilizes monitors to log all created and deleted entities:

```ts
let logEntitySystem = (world: World) => {
  world
    .monitor()
    .eachIncluded(entity => {
      console.log("created", entity)
    })
    .eachExcluded(entity => {
      console.log("deleted", entity)
    })
}
```

The entities a monitor recieves can be narrowed using query terms.

```ts
world.monitor(Client).eachIncluded((client, clientSocket) => {
  clientSocket.send("ping")
})
```

In plain terms, monitors execute the callback provided to `eachIncluded` for each entity that began to match the provided query terms at the end of the last step. It executes the `eachExcluded` callback for entities that no longer match the terms. They can be used to:

- mutate the world in response to entity changes
- update list or aggregate views in a UI
- broadcast events to a third-party library, service, or client

## Data Transience

Because [entity operations are deferred](./entities.md#entity-transaction) to the end of a step, component values are no longer available to a system by the time a monitor executes it's `eachExcluded` callback.

If you wish to access component values of an entity that no longer matches a monitor's terms, you can use a world's `monitorImmediate` method. `monitorImmediate` returns a monitor that is configured to run within the current step.

```ts
world.monitorImmediate(Enemy).eachExcluded((enemy, enemyPos) => {
  world.create(LootBag, enemyPos)
})
```

An immediate monitor must be executed downstream of its causal systems in the app's system execution pipeline. In the above example, the system should be configured using [ordering constraints](./systems.md#ordering-constraints) to occur _after_ the system that deletes `Enemy` entities.

```ts
app.addSystem(deleteDeadEntitiesSystem).addSystem(
  world => world.monitorImmediate(Enemy).eachExcluded(/* ... */),
  _ => _.after(deleteDeadEntitiesSystem),
)
```
