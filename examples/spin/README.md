# @javelin/spin

![](./screenshot.png)

This project is an example of synchronizing Javelin ECS worlds over WebRTC DataChannels.

Entities on the server are organized into a series of consecutive circles and slowly rotated. They are added and removed at random each tick. Each entity also has a random chance of being assigned or unassigned a `Big` component. The server sends synchronization instructions to all connected clients at a regular interval.

The server builds messages using [`MessageProducer`](https://javelin.games/networking/message-producer/) from the `@javelin/net` package.

## Getting Started

```sh
pnpm start
```

### Configuration

The server can be configured with the following environment variables:

```sh
PORT=8000
TICK_RATE=60
SEND_RATE=20
ENTITY_COUNT=100
MESSAGE_MAX_BYTE_LENGTH=Infinity
BIG_PRIORITY=1
SMALL_PRIORITY=2
SWAP_INTERVAL=1000
```

Just prepend the environment variables before the start command, e.g.

```sh
ENTITY_COUNT=500 MESSAGE_MAX_BYTE_LENGTH=1000 SWAP_INTERVAL=250 yarn start
```
