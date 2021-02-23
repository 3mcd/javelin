+++
title = "ECS"
weight = 2
sort_by = "weight"
insert_anchor_links = "right"
+++

## What's an ECS?

In traditional OOP game development, entity data and behavior is often architected using a class heirarchy. Take the following example, where a `Player` class extends a physics `Body` class to enhance players with physics properties:

<aside>
  <p>
    <strong>Note</strong> — all code in this section is pseudo-code. Skip to the <a href="/ecs/world">Hello World</a> section if you're ready for real examples.
  </p>
</aside>

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

The player presses the spacebar on their keyboard, `player.jump()` is executed, and the actor jumps! But what if a player wants to spectate our game instead controlling an actor? In that scenario, it's unnecessary for `Player` to extend `Body`, and we'd either need to modify the inheritance structure, or write code to ensure that spectators shouldn't update data within the physics simulation.

Data and behavior are separate concerns in an ECS. High-cohesion game objects are split into three distinct concerns: **components**, game data; **entities**, references to a vector of components; and **systems**, game behavior. This pattern gives us the ability to modify the behavior of entities at runtime.

### Components

In an ECS, components are typically plain objects that contain data and no methods. Ideally all game state lives in components.

```
Player { name: string }
Input { space: boolean }
Body { velocity: [number, number] }
```
### Entities

An entity is an integer that references a vector of components. An entity typically represents a game object (like a player, vehicle, or weapon) that could be made up of many components, but sometimes may only reference a single component with the purpose of holding global state. They do not contain any data of their own.
### Systems

Systems are functions that implement game logic by reading and modifying components. The following pseudo-code example moves entities with both a Position and a Velocity:

```
for entity of (pos, vel)
  pos[entity].x += vel[entity].x
  pos[entity].y += vel[entity].y
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
