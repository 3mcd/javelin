# Plugins

Composing a game as a series of modules increases the portability of your code. The same module can be used by multiple apps, like client and server apps, or different builds of your game.

Javelin uses the term **plugin** for a reusable module. A plugin is a function that modifies an app in some way.

Here is a plugin that adds a resource to an app:

```ts
export let pausePlugin = (app: j.App) => {
  app.addResource(Paused, false)
}
```

Plugins are added to an app via the `use` method.

```ts
app.use(pausePlugin)
```

## Plugin Example

Plugins help organize game code. Take the following snippet from an example in the [Javelin repo](https://github.com/3mcd/javelin/blob/main/examples/survive/src/index.ts#25), where each logical sub-unit of the sample game is arranged into its own plugin:

```ts
let app = j
  .app()
  .addGroup("render", j.after(j.Group.LateUpdate).before(j.Group.Late))
  .use(timePlugin)
  .use(clockPlugin)
  .use(disposePlugin)
  .use(bulletPlugin)
// ...
```

Let's open up the `timePlugin` plugin. It modifies the app by adding a `Time` resource and a system that advances the clock each step.

```ts
export let timePlugin = (app: j.App) =>
  app
    .addResource(Time, {previous: 0, current: 0, delta: 0})
    .addSystemToGroup(j.Group.Early, advanceTimeSystem)
```

This plugin isn't game-specific and could be easily shared with other Javelin projects. That's all there is to plugins!
