+++
title = "ECS"
weight = 2
sort_by = "weight"
insert_anchor_links = "right"
+++

## What's an ECS?

In traditional OOP game development, entity data and behavior exist within class heirarchies. Take the following (somewhat contrived) example, where the `Player` class extends `Body` to enhance players with physics properties:

```typescript
class Body {
  readonly velocity = [0, 0];
}

class Player extends Body {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  jump() {
    this.velocity[1] += 2;
  }
}

const input = new Input();
const player = new Player();

const step = () => {
  if (input.isSpacebarPressed()) {
    // apply force to launch player into the air
    player.jump();
  }
};
```

The player presses spacebar on their keyboard, `player.jump()` is executed, and the player moves upwards. But what if a player connects who is spectating our game and not controlling an actor? In this case, it isn't necessary for `Player` to extend `Body`, and we'd either need to write assertions to ensure that spectators shouldn't update data within the physics simulation, or drastically modify our class/inheritance structure.

Data and behavior are separate concerns in an ECS. High-cohesion game objects are replaced with distinct **entities**, **components**, and **systems**. This pattern gives us the ability to modify the behavior of entities at runtime through composition.

## ECS Atoms

### Components

Components are plain objects that contain data, but not methods. Ideally all game state lives in components, although this is seldom achieved since most projects will use third-party libraries.

```typescript
type Player = { name: string };
type Input = { space: boolean };
type Body = { velocity: [number, number] };
```

### Entities

Entities are tuples of components that represent higher-order game objects. They are absent of any data or behavior.

```typescript
// (Player, Input, Velocity)
const entity = [
  { player: "xXpubstomperXx" },
  { space: true },
  { velocity: [0, 0] },
];
```

### Systems

Systems are stateless functions that implement game behavior by reading and modifying a components. The following example updates the player's physics body based on its input component:

```typescript
const physicsSystem = () => {
  const [, input, body] = entity;

  if (input.space) {
    body.velocity[1] += 2;
  }
};
```

## Iteration

The above example of components, entities, and systems illustrates pattern that wouldn't scale to a game of any real complexity. The true power of ECS comes with iteration. We can apply the same rules to each entity in our game world with a simple for-of loop!

```typescript
const inputSystem = () => {
  for (const [player, input] of playerInputTuples) {
    // ...
  }
};

const physicsSystem = () => {
  for (const [player, body] of playerBodyTuples) {
    // ...
  }
};
```

If a player connects who simply wants to spectate, we can create a `(Player, Input)` entity instead of `(Player, Input, Body)`. The `Input` component could allow them to move the game camera around. If they decide they want to jump into the fray, we can insert a `Body` component into their entity, allowing the player to control a body in the simulation.

This pattern can be applied to many types of games. For example, an FPS game might consist of systems that handle physics, user input and movement, projectile collisions, and player inventory.