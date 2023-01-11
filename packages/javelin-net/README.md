# @javelin/net

Giving an entity a `NetworkId` component immediately makes each of its blueprint (schema-enhanced) components eligible for networking.

```ts
app
  .addResource(NetComponents, [Position, Velocity])
  .addPlugin(serverNetPlugin)
```

In this example, the positions and velocities of all entities with a `NetworkId` component are sent when changed.

The rate at which these values are sent to each client is configured using **awarenesses**.

```ts
// only ghosts can see other ghosts
let ghostInterest = interest(type(Ghost), (world, entity) =>
  world.has(entity, Ghost) ? 1 : 0,
)

let bodyInterest = interest(
  // for entities with a position, velocity and rotation
  type(Position, Velocity, Rotation),
  type(Position, Velocity, Rotation),
  // decrease the priority of p,v,r updates relative to distance
  (world, entity, object, objectPos) =>
    1 / distance(world.get(entity, Position), objectPos),
)

let clientAwareness = awareness()
  .addInterest(bodyInterest)
  .addInterest(ghostInterest)

app.addStartupSystem(world => {
  world.create(Client, clientTransport, clientAwareness)
})
```

A transport can receive many kinds of messages. You can route network messages to a transport's underlying stream based on the message type.

```ts
let clientTransport = {
  socket: new WebSocket("wss://..."),
  channel: peer.createDataChannel(),
  send(message: Uint8Array, messageType: number) {
    switch (messageType) {
      case MessageType.Update:
        this.socket.send(message)
        break
      case MessageType.Clock:
      case MessageType.Snapshot:
        this.channel.send(message)
        break
    }
  },
}
```
