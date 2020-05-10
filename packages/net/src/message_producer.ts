import {
  ComponentType,
  createQuery,
  createAddedFilter,
  Storage,
  createChangedFilter,
  Component,
  mutableEmpty,
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
  const componentsReliable = config.components.filter(
    c => typeof c.priority !== "number",
  )
  const componentsUnreliable = config.components.filter(
    c => typeof c.priority === "number" && c.priority > 0,
  )
  const priorities = createPriorityAccumulator(
    new Map(componentsUnreliable.map(c => [c.type.type, c.priority!])),
  )
  const queryAll = createQuery(...config.components.map(c => c.type))
  const queryReliable = createQuery(...componentsReliable.map(c => c.type))
  const queryUnreliable = createQuery(...componentsUnreliable.map(c => c.type))
  const filterChanged = createChangedFilter()
  const filterAdded = createAddedFilter()

  const payloadCreated: Component[][] = []
  const payloadReliable: Component[] = []
  const payloadUnreliable: Component[] = []
  const payloadRemoved: number[] = []

  let previousSendTime = 0

  function all(storage: Storage) {
    for (const r of queryAll.run(storage)) {
      payloadCreated.push(r.slice())
    }

    const message = protocol.insert(payloadCreated)

    mutableEmpty(payloadCreated)

    return [message]
  }

  function added(storage: Storage) {
    for (const r of queryAll.run(storage, filterAdded)) {
      payloadCreated.push(r.slice())
    }

    const message = protocol.insert(payloadCreated)

    mutableEmpty(payloadCreated)

    return [message]
  }

  function changed(storage: Storage) {
    for (const r of queryReliable.run(storage, filterChanged)) {
      for (let i = 0; i < componentsReliable.length; i++) {
        payloadReliable.push(r[i])
      }
    }

    const message = protocol.change(payloadReliable)

    mutableEmpty(payloadReliable)

    return [message]
  }

  function* unreliable(storage: Storage, time = Date.now()) {
    for (const results of queryUnreliable.run(storage)) {
      for (let i = 0; i < componentsUnreliable.length; i++) {
        priorities.update(results[i])
      }
    }

    if (time - previousSendTime < config.unreliableSendRate) {
      return
    }

    previousSendTime = time

    for (const c of priorities) {
      payloadUnreliable.push(c)
    }

    let metadata

    while ((metadata = yield protocol.update(payloadUnreliable, metadata))) {
      yield protocol.update(payloadUnreliable, metadata)
    }

    mutableEmpty(payloadUnreliable)
  }

  return {
    all,
    added,
    changed,
    unreliable,
  }
}
