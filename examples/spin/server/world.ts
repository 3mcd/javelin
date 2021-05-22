import {
  Component,
  component,
  createEffect,
  createQuery,
  createWorld,
  Entity,
  useInterval,
  useMonitor,
  World,
} from "@javelin/ecs"
import { Clock, createHrtimeLoop } from "@javelin/hrtime-loop"
import { createMessageProducer, encode } from "@javelin/net"
import { ChangeSet, reset, set } from "@javelin/track"
import { Big, Player, Shell, Transform } from "./components"
import {
  BIG_PRIORITY,
  ENTITY_COUNT,
  MESSAGE_MAX_BYTE_LENGTH,
  SEND_RATE,
  SMALL_PRIORITY,
  SWAP_INTERVAL,
  TICK_RATE,
} from "./env"
import { udp } from "./net"

export const world = createWorld<Clock>()

const players = createQuery(Player)
const transforms = createQuery(Transform)
const transformsBig = createQuery(Transform, Big)
const transformsTracked = createQuery(Transform, ChangeSet)
const transformsInShell = createQuery(Transform, Shell, ChangeSet)

export function createPointsAroundCircle(r: number, n: number) {
  const out = []
  for (let i = 0; i < n; i++) {
    const angle = (i / (n / 2)) * Math.PI
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    out.push([x, y])
  }
  return out
}

function getInitialMessage(world: World) {
  const producer = createMessageProducer()
  for (const [entities, [transforms, shells]] of transformsInShell) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const t = transforms[i]
      const s = shells[i]
      producer.attach(e, world.has(e, Big) ? [t, world.get(e, Big), s] : [t, s])
    }
  }
  return producer.take(true)
}

const useClients = createEffect(({ create, destroy }) => {
  const clients = new Map()
  const send_u = (entity: Entity, data: ArrayBuffer) =>
    clients.get(entity).send(data)
  const api = { send_u }

  udp.connections.subscribe(connection => {
    const entity = create(component(Player))
    clients.set(entity, connection)
    connection.closed.subscribe(() => {
      destroy(entity)
      clients.delete(entity)
    })
  })

  return function useClients() {
    return api
  }
})

const useMessage = createEffect(({ has }) => {
  const producer = createMessageProducer({
    maxByteLength: MESSAGE_MAX_BYTE_LENGTH,
  })
  return function useMessage(update = false) {
    useMonitor(
      transformsInShell,
      (e, [t, s]) => producer.attach(e, [t, s]),
      (e, [t, s]) => producer.detach(e, [t, s]),
    )
    useMonitor(
      transformsBig,
      (e, _, [, b]) => b && producer.attach(e, [b]),
      (e, _, [, b]) => b && producer.detach(e, [b]),
    )
    if (update) {
      transformsTracked((e, [, c]) => {
        const priority = has(e, Big) ? BIG_PRIORITY : SMALL_PRIORITY
        producer.patch(e, c, priority)
        reset(c)
      })
    }
    return producer
  }
})

world.addSystem(world => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const clients = useClients()
  const producer = useMessage(send)
  if (!send) return
  const message = producer.take()
  players((e, [p]) => {
    let packet
    if (p.initialized) {
      packet = message
    } else {
      packet = getInitialMessage(world)
      p.initialized = true
    }
    if (packet) {
      clients.send_u(e, encode(packet))
    }
  })
})

world.addSystem(world => {
  if (!useInterval(SWAP_INTERVAL)) return
  let count = 0
  transforms(e => {
    const random = Math.random()
    if (random > 0.9) {
      world.destroy(e)
      count++
    } else if (random > 0.5) {
      if (world.has(e, Big)) {
        world.detach(e, Big)
      } else {
        world.attach(e, component(Big))
      }
    }
  })
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    world.create(
      component(Transform, {
        x: Math.cos(a) * 50,
        y: Math.sin(a) * 50,
      }),
      component(Shell, { value: (i % 6) + 1 }),
      component(ChangeSet),
    )
  }
})

world.addSystem(() =>
  transformsInShell((e, [t, s, c]) => {
    const a = Math.atan2(t.y, t.x) + 0.01
    set(t, c, "x", Math.cos(a) * (s.value * 50))
    set(t, c, "y", Math.sin(a) * (s.value * 50))
  }),
)

createPointsAroundCircle(50, 10).map(([x, y], i) => {
  const components: Component[] = [
    component(Transform, { x, y }),
    component(Shell, { value: (i % 6) + 1 }),
    component(ChangeSet),
  ]
  if (i % 2 === 0) {
    components.push(component(Big))
  }
  world.create(...components)
})

createHrtimeLoop(world.step, (1 / TICK_RATE) * 1000).start()
