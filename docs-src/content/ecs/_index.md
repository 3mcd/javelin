+++
title = "ECS"
weight = 3
sort_by = "weight"
insert_anchor_links = "right"
+++

This section aims to serve as a quick primer on Entity Component Systems (ECS) and how to think in ECS. The goal is not to belittle other methods of building games or make ECS seem like a panacea, because ECS does come with its own challenges. Juan Linietsky wrote a great article about [why Godot does not use ECS](https://godotengine.org/article/why-isnt-godot-ecs-based-game-engine) that I recommend you read if you're trying to determine whether or not you should use Javelin.

<aside>
  <p>
    <strong>Tip</strong> — this section contains pseudo-code. Skip to the <a href="/ecs/world">Hello World</a> section if you're ready for real examples.
  </p>
</aside>

## Building a Game

A best practice in OOP is to favor composition over inheritance. Take the following example, where a `Player` class accepts `RigidBody` and `Input` objects to enhance players with physics properties and input control:

```ts
class RigidBody {
  readonly velocity = { x: 0, y: 0 }
}

class Player {
  private body: RigidBody
  private input: Input

  constructor(body: RigidBody, input: Input) {
    this.body = body
    this.input = input
  }

  jump() {
    this.body.velocity[1] += 1
  }

  update() {
    if (this.input.key("space")) {
      this.jump()
    }
  }
}

const player = new Player(new RigidBody(), new Input())

setInterval(() => {
  player.update()
}, 16.66666)
```

When the player presses the spacebar on their keyboard, `player.jump()` is called, and the physics body jumps! Easy enough.

What if a player wants to spectate our game instead of controlling a character? In that scenario, it would be unnecessary for `Player` to care about `RigidBody`, and we'd need to write code that makes `RigidBody` an optional dependency of `Player`, e.g.

```ts
class Player {
  private body?: RigidBody
  ...
  jump() {
    this.body?.velocity[1] += 1
  }
}
```

If there are many states/dependencies a player can have (e.g. spectating, driving a vehicle, etc.), our `Player` class might explode with complexity. Going even further, `Player` would need to define all it's possible dependencies in advance, making runtime composition difficult or even impossible.

## What's an ECS?

Data and behavior are separate concerns in an ECS. There are three main parts to an ECS: **components** – game data, **entities** – game objects (like a tree, chest, or spawner), and **systems** – game behavior. As we'll see, this architecture enables runtime composition of behavior that would be tricky to implement in the example above.

### Components

In an ECS, components are typically plain objects that contain data and no methods. Ideally all game state lives in components.

```
player = { name: string }
input  = { jump: boolean }
body   = { velocity: [number, number] }
```

### Entities

In most ECS (including Javelin) entities are integers that reference a unique array of components. An entity typically represents a game object (like a player, vehicle, or weapon) that could be made up of many components. Entities do not store any data of their own, and are fully defined by their component makeup.

### Systems

Systems are functions that iterate over entities and modify their components. Systems contain most (ideally all) game logic in an ECS. The following pseudo-code is a depiction of how we might implement the jumping behavior from the above "traditional" example using the ECS pattern.

```
for entity of (player, input, body)
  if (input[entity].jump)
    body[entity].y += 1
```

This example shows a system which iterates all components with `Player`, `RigidBody`, and `Input` (e.g. a gamepad) components. Each player's input component is checked to determine if the jump key is pressed. If so, we locate the entity's body component and add to it's y-velocity.

Spectators can now be represented with a `(Player, Input)` entity. Even though they aren't controlling a physics body yet, the `Input` component might allow them to move the game camera around. If the player chooses to enter the fray, we can insert a `RigidBody` component into their entity, allowing them to control an actor in the scene.

```ts
add(entity, RigidBody)
```

This pattern can be applied to many types of games. For example, an FPS game might consist of systems that handle physics, user input and movement, projectile collisions, and player inventory.
