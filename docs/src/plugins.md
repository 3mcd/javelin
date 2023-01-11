# Plugins

Composing a game as a series of modules increases the portability of your code. The same module can be used by multiple apps, like client and server apps, or different builds of your game.

Javelin uses the term **plugin** for a reusable module. A plugin is a function that modifies an app in some way.

Here is a plugin that adds a resource to an app:

```ts
export default function pause_plugin(app: App) {
  app.add_resource(Paused, false)
}
```

Plugins are added to an app via the `use` method.

```ts
app.use(pause_plugin)
```

## Plugin Example

Plugins help organize game code. Take the following snippet from an example in the [Javelin repo](https://github.com/3mcd/javelin/blob/main/examples/survive/src/index.ts#25), where each logical sub-unit of the sample game is arranged into its own plugin:

```ts
let game = app()
  .add_group("render", _ =>
    _.after(Group.LateUpdate).before(Group.Late),
  )
  .use(time_plugin)
  .use(clock_plugin)
  .use(dispose_plugin)
  .use(bullet_plugin)
  // ...
```

Let's open up the `time_plugin` plugin. It modifies the app by adding a `Time` resource and a system that advances the clock each step.

```ts
export let time_plugin = (app: App) =>
  app
    .add_resource(Time, {previous: 0, current: 0, delta: 0})
    .add_system_to_group(Group.Early, advance_time_system)
```

This plugin isn't game-specific and could be easily shared with other Javelin projects. That's all there is to plugins!

