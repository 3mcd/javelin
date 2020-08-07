+++
title = "ECS"
weight = 2
sort_by = "weight"
insert_anchor_links = "right"
+++

<aside>
  <p>
    <strong>Note</strong> — all code samples in this section are written in pseudo-code.
  </p>
</aside>

## What's an ECS?

In traditional OOP game development, entity data and behavior is often architected using a class heirarchy. Take the following example, where a `Player` class extends a physics `Body` class to enhance players with physics properties:

```typescript
class Body {
  readonly velocity = [0, 0]
}

class Player extends Body {
  readonly name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  jump() {
    this.velocity[1] += 2
  }
}

const input = new Input()
const player = new Player()

setInterval(() => {
  if (input.isSpacebarPressed()) {
    // apply force to launch player into the air
    player.jump()
  }
}, 16.66666)
```

The player presses the spacebar on their keyboard, `player.jump()` is executed, and the actor jumps! But what if a player wants to spectate our game instead controlling an actor? In that scenario, it's unnecessary for `Player` to extend `Body`, and we'd either need to write code to ensure that spectators shouldn't update data within the physics simulation, or drastically modify our inheritance structure.

Data and behavior are separate concerns in an ECS. High-cohesion game objects are replaced with distinct **entities**, **components**, and **systems**. This pattern gives us the ability to modify the behavior of entities at runtime.

### Components

Components are plain objects that contain data, but not methods. Ideally all game state lives in components.

```typescript
type Player = { name: string }
type Input = { space: boolean }
type Body = { velocity: [number, number] }
```

### Entities

Entities are tuples of components that represent higher-order game objects. They do not contain any data of their own.

```typescript
// (Player, Input, Velocity)
const entity = [
  { name: "xXpubstomperXx" },
  { space: true },
  { velocity: [0, 0] },
]
```

### Systems

Systems are functions that implement game logic by reading and modifying components. The following example updates the player's physics body based on its input component:

```typescript
const physicsSystem = () => {
  const [, input, body] = entity

  if (input.space) {
    body.velocity[1] += 2
  }
}
```

## Iteration

The above example where a single entity is modified each tick wouldn't scale to a game of any real complexity. The true power of ECS comes with iteration. We can apply the same rules to each entity in our game world with a simple for..of loop.

```typescript
const physicsSystem = () => {
  for (const [player, input, body] of playersWithBodies) {
    // do something for each player with input and body components
  }
}
```

We can add jump behavior to _all_ players that have both an input and a body component!

Spectators can now be represented with a `(Player, Input)` entity. Even though they aren't controlling a physics body yet, the `Input` component might allow them to move the game camera around. If the player chooses to enter the fray, we can insert a `Body` component into their entity, allowing them to control an actor in the scene.

```typescript
for (const [player] of players) {
  if (player.joining && !hasBody(player)) {
    world.insert(player, [body])
    player.joining = false
  }
}
```

The player's entity is now `(Player, Input, Body)`, making it eligible for physics updates from the physics simulation.

This pattern can be applied to many types of games. For example, an FPS game might consist of systems that handle physics, user input and movement, projectile collisions, and player inventory.
