# Hello World

> The complete source produced in this tutorial can be found [in the Javelin repo](https://github.com/3mcd/javelin-1/blob/main/examples/simple/src/index.ts).

In this guide, we'll build a simple game where players move a 2d box with a keyboard.

First, we'll install the core Javelin ECS library:

```sh
npm install @javelin/ecs
```

Then we'll load Javelin into a document with a `<canvas>` element:

```html
<html>
  <body>
    <canvas></canvas>
    <script type="module">
      import {App} from "node_modules/@javelin/core/dist/index.mjs"
    </script>
  </body>
</html>
```

## Create an App

At the core of any Javelin game is an **app**.

```ts
let game = app()
```

Apps are responsible for running **systems**—functions that implement game logic, against a **world**—game state.

Most Javelin projects will need just one app.

## Create a Box

An app has a single world by default. A world manages all game state, primarily entities and their components. Our game has a single entity: a box.

Entities are created using a world's `create()` method. In order to create our box, we need to get a reference to the app's world. We can do this using a **startup system**, a function that is executed once when the app is initialized.

```ts
function create_box_system(world: World) {
  let box = world.create()
}
game.add_init_system(create_box_system)
game.step()
```

A box will be created when `game.step()` is called, only once, before any other game logic is run.

Our entity doesn't have any box-like qualities yet. Entities don't have any intrinsic state. In fact, they're just integers that identify a unique array of **component values**. Most game state is stored in component values.

In this exercise, we'll define two components: one for the position of the box, and another for its color:

```ts
let Position = component<{x: number; y: number}>()
let Color = component<string>()
```

> `Position` and `Color` are called components. Objects that conform their shape (e.g. `{x:0, y:0}`) are called component values.

Component values are added to entities using a world's `add` method. Let's give our entity some position and color data:

```ts
function create_box_system(world: World) {
  let box = world.world()
  world.add(box, Position, {x: 0, y: 0})
  world.add(box, Color, "#ff0000")
}
```

We can condense the two add calls into a single statement using a **type**. A type is an alias for a set of components. Let's create a `Box` type that will come in handy whenever we need to reference an entity with both a position and a color.

```ts
let Box = type(Position, Color)
```

We could then rewrite the two `world.add` statements with a single statement like so:

```ts
world.add(box, Box, {x: 0, y: 0}, "#ff0000")
```

> Types are composable with components and other types. For example, the `Box` type could be combined with a `Loot` component to create a new type, like `type(Box, Loot)`.

## Move the Box

We'll hook up our box to user input in a new system. Unlike the startup system we created, this system will execute continuously so the game can respond to keyboard input.

But before it can move anything, the system will first need to locate the box. Requesting information about a world is the most common task an ECS does. Sometimes the requests are simple, like _"find all boxes"_. But occasionally more nuanced requests like _"find all hungry hippos that aren't on fire"_ are required. In Javelin, these requests are expressed using **queries**.

A system is a function that recieves a world as its sole argument. Typically a system will:

- Request resources (global state that won't fit plainly into entities)
- Run queries against a world
- Read/write component data

This system will need to perform all three of these operations: get the input resource, find the box using a query, and update the box's position.

We'll first get a reference to the device's keyboard state using `world.get_resource`:

```ts
function move_box_system(world: World) {
  let {key} = world.get_resource(Input)
}
```

Then we'll find and update the box using a query. `world.of` returns an iterable collection of entities that match a list of types and components to a callback function:

```ts
world.of(Box).each((box, box_pos) => {
  box_pos.x += Number(key("ArrowRight")) - Number(key("ArrowLeft"))
  box_pos.y += Number(key("ArrowDown")) - Number(key("ArrowUp"))
})
```

## Draw the Box

The next step is to draw the box to the screen. We'll use the document's sole canvas element as our rendering medium. To draw to the canvas we need a reference to its [2d rendering context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D).

Javelin's API encourages code reuse and portability. Systems are more portable when they have fewer global or module-level dependencies, which is especially useful when sharing systems between apps (like a client and server). All a system receives is an instance of `World`—so how can we provide the drawing context to our render system(s) without resorting to a global variable or singleton?

We can define a **resource** for it. Resources let us provide arbitrary values to our systems. Let's create a resource for a `CanvasRenderingContext2D`:

```ts
let Context2D = resource<CanvasRenderingContext2D>()
```

Next, we'll provide the app a value for the `Context2D` resource using its `add_resource` method.

```ts
let context = document.querySelector("canvas")!.getContext("2d")
game.add_resource(Context2D, context)
```

> Resources can provide _any_ value to systems. This includes third party library objects, singleton entities, and any other game state that doesn't clearly fit into entities and components.

Image data is not automatically cleared from canvas elements, so we should write a system that erases the canvas so we don't draw our box on top of old pixels. We'll get the draw context using the `useResource` effect (which simply calls `world.getResource`), and call its `clearRect()` method:

```ts
function clear_canvas_system(world: World) {
  let context = world.get_resource(Context2D)
  context.clearRect(0, 0, 300, 150) // default canvas width/height
}
```

Taking everything we've learned so far about systems, queries, and resources, we can write a system that draws our box to the canvas:

```ts
function draw_box_system(world: World) {
  let context = world.get_resource(Context2D)
  world.of(Box).each((box, box_pos, box_color) => {
    context.fillStyle = box_color
    context.fillRect(pox_pos.x, box_pos.y, 50, 50)
  })
}
```

## Hook it Up

Our movement and rendering systems are fully implemented! We just need to register them with our app. We'll use the app's `add_system` method to instruct the app to execute the system each time the app's `step` method is called.

Systems are executed in the order in which they are added. So we could simply add them sequentially:

```ts
game
  // Add our systems in order:
  .add_system(move_box_system)
  .add_system(clear_canvas_system)
  .add_system(draw_box_system)
```

This practice doesn't work well for larger games with dozens of systems. At scale, adding and reordering systems becomes impractical because systems must be ordered _just right_ for the app to function predictably.

We want to ensure that our render systems are executed after our movement system so our players see the most up-to-date game state at the end of each frame. Javelin splits each step into a pipeline of **system groups**. We can ensure that our render systems execute after our behavior systems by moving them to a group that executes later in the pipeline.

Systems are added to the `Group.Update` group by default. So we can add our rendering systems to a system group that follows, like `Group.LateUpdate`, to ensure they run after our game behavior. A system can be added to a group other than `App.Update` via an app's `add_system_to_group` method:

```ts
game
  .add_system(move_box_system)
  .add_system_to_group(Group.LateUpdate, clear_canvas_system)
  .add_system_to_group(Group.LateUpdate, draw_box_system)
```

Now, regardless of the order the systems are added in, `move_box_system` will always run before the box is drawn to the canvas.

We can also add **constraints** to systems to ensure they execute in a deterministic order within a group. Each system registration method accepts a **constraint builder** that defines the ordering of systems within a group.

We want to ensure our box is drawn to the canvas _only after_ the canvas is cleared, otherwise the user may see nothing each frame. We can accomplish this like so:

```ts
game.add_system_to_group(Group.LateUpdate, draw_box_system, _ => _.after(clear_canvas_system))
```

## Hello, Box!

Our final app initialization statement should look like this:

```ts
app
  .add_resource(Context2D, context)
  .add_init_system(create_box_system)
  .add_system(move_box_system)
  .add_system_to_group(Group.LateUpdate, clear_canvas_system)
  .add_system_to_group(Group.LateUpdate, draw_box_system, _ => _.after(clear_canvas_system))
```

Once we call `game.step()` at a regular interval, you should see our box move when the arrow keys are pressed.

```ts
function loop() {
  app.step()
  requestAnimationFrame(loop)
}
loop()
```

Move on to the next chapter to see some examples of other games made with Javelin.