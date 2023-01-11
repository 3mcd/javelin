# @javelin/net

Giving an entity a `NetworkId` component immediately makes each of its blueprint (schema-enhanced) components eligible for networking.

```ts
app
  .add_resource(NetComponents, [Position, Velocity])
  .add_plugin(server_net_plugin)
```

In this example, the positions and velocities of all entities with a `NetworkId` component are sent when changed.

The rate at which these values are sent to each client is configured using **awarenesses**.

```ts
// only ghosts can see other ghosts
let ghost_interest = interest(type(Ghost), (world, entity) =>
  world.has(entity, Ghost) ? 1 : 0,
)

let body_interest = interest(
  // for entities with a position, velocity and rotation
  type(Position, Velocity, Rotation),
  type(Position, Velocity, Rotation),
  // decrease the priority of p,v,r updates relative to distance
  (world, entity, object, object_pos) =>
    1 / distance(world.get(entity, Position), object_pos),
)

let client_awareness = awareness()
  .add_interest(body_interest)
  .add_interest(ghost_interest)

app.add_startup_system(world => {
  world.create(Client, client_transport, client_awareness)
})
```

A transport can receive many kinds of messages. You can route network messages to a transport's underlying stream based on the message type.

```ts
let client_transport = {
  socket: new WebSocket("wss://..."),
  channel: peer.createDataChannel(),
  send(message: Uint8Array, message_type: number) {
    switch (message_type) {
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
