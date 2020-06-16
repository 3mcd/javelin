import {
  changed,
  Component,
  ComponentType,
  created,
  createQuery,
  destroyed,
  mutableEmpty,
  QueryLike,
  World,
} from "@javelin/ecs"
import { createPriorityAccumulator } from "./priority_accumulator"
import { JavelinMessage, protocol } from "./protocol"

export type NetworkMessageEncoder<E = any> = (message: JavelinMessage) => E

export type ProducerConfig<E> = {
  encode?(message: JavelinMessage): E
  components: {
    type: ComponentType
    priority?: number
  }[]
  unreliableSendRate: number
  maxUpdateSize: number
}

function createMessageFactory<
  Fn extends (components: Component[]) => JavelinMessage
>(
  create: Fn,
  queries: QueryLike<ComponentType[]>[],
  encode: NetworkMessageEncoder,
): (world: World) => ReturnType<Fn> {
  const payload: Component[] = []

  return function messageFactory(world: World) {
    mutableEmpty(payload)

    for (const query of queries) {
      for (const [c] of world.query(query)) {
        payload.push(c)
      }
    }

    return payload.length > 0 && encode(create(payload))
  }
}

export function createMessageProducer<E>(config: ProducerConfig<E>) {
  const { encode = _ => _, unreliableSendRate, maxUpdateSize } = config
  const all = config.components.map(c => c.type)
  const componentTypesReliable = config.components
    .filter(c => typeof c.priority !== "number")
    .map(c => c.type)
  const unreliableConfig = config.components.filter(
    c => typeof c.priority === "number" && c.priority > 0,
  )
  const unreliableQuery = unreliableConfig.map(c => createQuery(c.type))
  const unreliablePayload: Component[] = []
  const priorities = createPriorityAccumulator(
    new Map(unreliableConfig.map(c => [c.type.type, c.priority!])),
  )

  let previousSendTime = 0

  function* unreliable(world: World, time = Date.now()) {
    mutableEmpty(unreliablePayload)

    for (const query of unreliableQuery) {
      for (const [c] of world.query(query)) {
        priorities.update(c)
      }
    }

    if (time - previousSendTime < unreliableSendRate) {
      return
    }

    previousSendTime = time

    let i = maxUpdateSize

    for (const c of priorities) {
      unreliablePayload.push(c)
      if (--i <= 0) break
    }

    let metadata

    while ((metadata = yield protocol.update(unreliablePayload, metadata))) {
      yield protocol.update(unreliablePayload, metadata)
    }
  }

  return {
    all: createMessageFactory(
      protocol.create,
      all.map(c => createQuery(c)),
      encode,
    ),
    created: createMessageFactory(
      protocol.create,
      all.map(c => createQuery(c).filter(created)),
      encode,
    ),
    changed: createMessageFactory(
      protocol.change,
      componentTypesReliable.map(c => createQuery(c).filter(changed)),
      encode,
    ),
    destroyed: createMessageFactory(
      result => protocol.destroy(result.map(c => c._e)),
      all.map(c => createQuery(c).filter(destroyed)),
      encode,
    ),
    unreliable,
  }
}
