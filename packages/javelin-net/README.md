# @javelin/net

```ts
import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"

let PlayerStatus = j.slot(Alive, Dead)
let Body = j.type(Position, Velocity, Rotation, PlayerStatus)
let Player = j.type(Health, Body)

let networkModel = {
  components: [Position, Velocity, Rotation, PlayerStatus],
}

app
  // configure networked components
  .addResource(jn.NetworkModel, networkModel)
  // install server plugin
  .addPlugin(jn.serverPlugin)
```

When and how components are sent is configured using per-client **awarenesses**. An awareness is composed of **presences**—the entities (called subjects) that are in scope for a given client, and **interests**—the components of present entities that a client should know about.

```ts
let client = world.create()

let alivePlayerPresence = jn.presence(j.type(Player, PlayerStatus(Alive)))

// only dead players can see other dead players
let deadPlayerPresence = jn.presence(
  j.type(Player, PlayerStatus(Dead)),
  (world, entity) => world.has(entity, PlayerStatus(Dead)),
)

// compute a number that scales inversely with the distance between entity and subject
let distancePrioritizer: jn.SubjectPrioritizer = (world, entity, subject) =>
  1 / distance(world.get(entity, Position), world.get(subject, Position))

// send changed health component values, prioritizing entities closer to the player
let healthInterest = jn.interest(Player, Changed(Health), distancePrioritizer)

// snapshot interests send continuous, redundant updates to clients that allow clients to
// correct prediction errors
let bodyInterest = jn.snapshotInterest(Body, distancePrioritizer)

// compile the presences and interests into the client's awareness
let clientAwareness = jn.awareness(
  client,
  deadPlayerPresence,
  alivePlayerPresence,
  bodyInterest,
  healthInterest,
)

world.add(client, jn.Client, jn.WebsocketTransport(socket), clientAwareness)
```

## Prediction

shared.ts

```ts
export let Input = j.command({h: "u8", v: "u8"})
export let movePlayerSystem = (world: j.World) => {
  world.commands(Input).each(input => {})
}
```

client.ts

```ts
import {Input, movePlayerSystem} from "./shared"

let handlePlayerInputSystem = (world: j.World) => {
  let deviceInput = world.getResource(DeviceInput)
  world.getResource(jn.ServerWorld).dispatch(Input, {
    entity: world.getResource(PlayerEntity),
    h: +deviceInput.keys.a,
    v: +deviceInput.keys.w,
  })
}

app
  .use(jn.clientPlugin)
  .addInitSystem(world => {
    world
      .getResource(jn.ServerWorld)
      .addSystemToGroup(j.FixedGroup.Update, movePlayerSystem)
  })
  .addSystemToGroup(j.Group.Early, handlePlayerInputSystem)
```

server.ts

```ts
let playerPresence = jn.presence(Player)
let playerInterest = jn.snapshotInterest(Player)

app.use(jn.serverPlugin).addSystem(world => {
  // when client connects...
  world.create(jn.Client, jn.awareness(playerPresence, playerInterest))
})
```
