+++
title = "ECS"
weight = 3
sort_by = "weight"
insert_anchor_links = "right"
+++

## What's an ECS?

<aside>
  <p>
    <strong>Note</strong> — this section contains pseudo-code. Skip to the <a href="/ecs/world">Hello World</a> section if you're ready for real examples.
  </p>
</aside>

Entity data and behavior is often architected using class heirarchies in game development. Take the following example, where a `Player` class extends a physics `Body` class to enhance players with physics properties:

```typescript
class Body {
  readonly velocity = { x: 0, y: 0 }
}

class Player extends Body {
  input: Input

  constructor(public input: Input) {}

  jump() {
    this.velocity[1] += 1
  }
}

const input = new Input()
const player = new Player(input)

setInterval(() => {
  if (input.isSpacebarPressed()) {
    // apply force to launch player into the air
    player.jump()
  }
}, 16.66666)
```

When the player presses the spacebar on their keyboard, `player.jump()` is called, and the physics body jumps! Easy enough.

What if a player wants to spectate our game instead of controlling a character? In that scenario, it would be unnecessary for `Player` to extend `Body`, and we'd either need to modify the inheritance structure, or write defensive code to ensure that spectators shouldn't touch the physics simulation.

Data and behavior are separate concerns in an ECS. High-cohesion game objects are substituted with three distinct concerns: (1) **components** – game data, (2) **entities** – game objects (like a tree, chest, or spawn position), and (3) **systems** – game behavior. 

### Components

In an ECS, components are typically plain objects that contain data and no methods. Ideally all game state lives in components.

```
Player { name: string }
Body { velocity: [number, number] }
Input { space: boolean }
```

### Entities

In Javelin, an entity is an integer that references a vector (array) of components. An entity typically represents a game object (like a player, vehicle, or weapon) that could be made up of many components, but sometimes may only reference a single component with the purpose of holding global state. Entities do not store any data of their own, and are fully defined by their component makeup.

### Systems

Systems are functions that iterate over entities and modify their components. Systems contain most (ideally all) game logic in an ECS. The following pseudo-code is a depiction of how we might implement the jumping behavior from the above "traditional" example using the ECS pattern.

```
for entity of (player, input, body)
  if (input[entity].jump)
    body[entity].y += 1
```

This example shows a system which iterates all components that have a `Player`, `Body`, and `Input` (e.g. a gamepad) component. Each player's input component is checked to determine if the jump key is pressed. If so, we locate the entity's body component and add to it's y-velocity.

Spectators can now be represented with a `(Player, Input)` entity. Even though they aren't controlling a physics body yet, the `Input` component might allow them to move the game camera around. If the player chooses to enter the fray, we can insert a `Body` component into their entity, allowing them to control an actor in the scene.

```
add(entity, Body)
```

This pattern can be applied to many types of games. For example, an FPS game might consist of systems that handle physics, user input and movement, projectile collisions, and player inventory.
