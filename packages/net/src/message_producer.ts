import {
  Component,
  ComponentType,
  createAddedFilter,
  createChangedFilter,
  createDestroyedFilter,
  createQuery,
  mutableEmpty,
  World,
} from "@javelin/ecs"
import { createPriorityAccumulator } from "./priority_accumulator"
import { protocol } from "./protocol"

export type PriorityConfig = {
  components: {
    type: ComponentType
    priority?: number
  }[]
  unreliableSendRate: number
  maxUpdateSize: number
}

export function createMessageProducer(config: PriorityConfig) {
  const componentTypesReliable = config.components
    .filter(c => typeof c.priority !== "number")
    .map(c => c.type)
  const configUnreliable = config.components.filter(
    c => typeof c.priority === "number" && c.priority > 0,
  )
  const priorities = createPriorityAccumulator(
    new Map(configUnreliable.map(c => [c.type.type, c.priority!])),
  )
  const allComponents = config.components.map(c => c.type)
  const queryAll = createQuery(...allComponents)
  const queryUnreliable = createQuery(...configUnreliable.map(c => c.type))
  const queryAdded = createQuery(...allComponents).filter(createAddedFilter())
  const queryDestroyed = createQuery(...allComponents).filter(
    createDestroyedFilter(),
  )
  const queryReliableChanged = createQuery(...componentTypesReliable).filter(
    createChangedFilter(),
  )

  const payloadCreated: Component[][] = []
  const payloadDestroyed: number[] = []
  const payloadReliable: Component[] = []
  const payloadUnreliable: Component[] = []

  let previousSendTime = 0

  function all(world: World) {
    mutableEmpty(payloadCreated)

    for (const r of world.query(queryAll)) {
      payloadCreated.push(r.slice())
    }

    if (payloadCreated.length > 0) {
      const message = protocol.create(payloadCreated)

      return [message]
    }

    return []
  }

  function created(world: World) {
    mutableEmpty(payloadCreated)

    for (const r of world.query(queryAdded)) {
      payloadCreated.push(r.slice())
    }

    if (payloadCreated.length > 0) {
      const message = protocol.create(payloadCreated)

      return [message]
    }

    return []
  }

  function changed(world: World) {
    mutableEmpty(payloadReliable)

    for (const r of world.query(queryReliableChanged)) {
      for (let i = 0; i < componentTypesReliable.length; i++) {
        payloadReliable.push(r[i])
      }
    }

    if (payloadReliable.length > 0) {
      const message = protocol.change(payloadReliable)

      return [message]
    }

    return []
  }

  function destroyed(world: World) {
    mutableEmpty(payloadDestroyed)

    for (const r of world.query(queryDestroyed)) {
      for (let i = 0; i < config.components.length; i++) {
        payloadDestroyed.push(r[i]._e)
      }
    }

    if (payloadDestroyed.length > 0) {
      const message = protocol.destroy(payloadDestroyed)

      return [message]
    }

    return []
  }

  function* unreliable(world: World, time = Date.now()) {
    mutableEmpty(payloadUnreliable)

    for (const results of world.query(queryUnreliable)) {
      for (let i = 0; i < configUnreliable.length; i++) {
        priorities.update(results[i])
      }
    }

    if (time - previousSendTime < config.unreliableSendRate) {
      return
    }

    previousSendTime = time

    let i = config.maxUpdateSize

    for (const c of priorities) {
      payloadUnreliable.push(c)
      if (--i <= 0) break
    }

    let metadata

    while ((metadata = yield protocol.update(payloadUnreliable, metadata))) {
      yield protocol.update(payloadUnreliable, metadata)
    }
  }

  return {
    all,
    created,
    changed,
    destroyed,
    unreliable,
  }
}
