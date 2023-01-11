# Resources

You may find yourself struggling to represent some game state as an entity, or you may be integrating a third-party library like [Three.js](https://threejs.org/) or [Rapier](https://rapier.rs/docs/user_guides/javascript/getting_started_js). Javelin provides resources as an alternative to one-off entities or singleton components.

Resources are useful for:
- [Run criteria](./systems.md#run-criteria) dependencies, e.g. a promise that must resolve before a system can run
- [Plugin](./plugins.md) configuration values
- Third-party library objects like a Three.js scene or Rapier physics world
- Global state that applies to all entities, like a game clock
- Abstractions over external dependencies like device input or [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## Resource Registration

Resources are identifiers for arbitrary values. A resource identifier is created with the `resource` function. `resource` accepts a single type parameter that defines the resource's value.

```ts
let Scene = resource<Three.Scene>()
```

Resources are added to an app with the `add_resource` method.

```ts
game.add_resource(Scene, new Three.Scene())
```

## Resource Retrieval

The value of a given resource can be read using an app's `get_resource` method.

```ts
let scene = app.get_resource(Scene)
```

`get_resource` will throw an error if the resource had not been previously added.

Resources are stored in an app's world so that systems can request resources.

```ts
app.add_system(world => {
  let scene = world.get_resource(Scene)
})
```

Systems can overwrite resources using a world's `set_resource` method.

```ts
app.add_system(world => {
  world.set_resource(Now, performance.now())
})
```
