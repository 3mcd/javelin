import {
  $worldStorageKey,
  Component,
  ComponentSpec,
  mutableEmpty,
  System,
  World,
  WorldOp,
  WorldOpType,
} from "@javelin/ecs"
import { JavelinMessage, JavelinMessageType } from "./protocol"

export type MessageHandler = {
  push(message: JavelinMessage): void
  system: System<unknown>
  getLocalEntity(remoteEntity: number): number
  tryGetLocalEntity(remoteEntity: number): number | null
  messages: ReadonlyArray<JavelinMessage>
}

export function createMessageHandler(): MessageHandler {
  const messages: JavelinMessage[] = []
  const remoteToLocal = new Map<number, number>()
  const toStopTracking = new Set<number>()

  function handleOps(ops: WorldOp[], isLocal: boolean, world: World) {
    const copy = [...ops]

    if (!isLocal) {
      let i = 0

      while (i < copy.length) {
        const op = copy[i]

        let local: number

        if (op[0] === WorldOpType.Create) {
          local = world.create(op[2])
          remoteToLocal.set(op[1], local)
          copy.splice(i, 1)
        } else {
          const remote = op[1]
          local = getLocalEntity(remote)

          if (op[0] === WorldOpType.Destroy) {
            toStopTracking.add(remote)
          }

          i++
        }

        op[1] = local
      }
    }

    toStopTracking.forEach(entity => remoteToLocal.delete(entity))
    toStopTracking.clear()

    world.applyOps(copy)
  }

  function handleUpdate(
    components: Component[],
    isLocal: boolean,
    world: World,
  ) {
    let i = 0
    while (i < components.length) {
      const component = components[i]
      const entity = component._e
      const local = isLocal ? entity : tryGetLocalEntity(entity)

      if (local === null) {
        components.splice(i, 1)
        continue
      }

      component._e = local

      try {
        world[$worldStorageKey].upsert(component)
      } catch (err) {
        // Upsert failed, potentially due to a race condition between reliable
        // and unreliable channels.
        console.warn(
          `Remote update for entity ${local} with component type ${component._t} failed because entity had not been created yet or had already been destroyed.`,
        )
        components.splice(i, 1)
        continue
      }

      i++
    }
  }

  function getLocalEntity(opOrComponent: WorldOp | Component | number) {
    let remote: number

    if (typeof opOrComponent === "number") {
      remote = opOrComponent
    } else {
      remote = Array.isArray(opOrComponent)
        ? opOrComponent[1]
        : opOrComponent._t
    }

    const local = remoteToLocal.get(remote)

    if (typeof local !== "number") {
      throw new Error(
        `Could not find local counterpart for remote entity ${remote}.`,
      )
    }

    return local
  }

  function tryGetLocalEntity(opOrComponent: WorldOp | Component | number) {
    try {
      return getLocalEntity(opOrComponent)
    } catch {
      return null
    }
  }

  function handleSpawn(components: ComponentSpec[], world: World) {
    world.create(components)
  }

  function applyMessage(message: JavelinMessage, world: World) {
    switch (message[0]) {
      case JavelinMessageType.Ops:
        handleOps(message[1], message[2], world)
        break
      case JavelinMessageType.Update:
        handleUpdate(message[1], message[2], world)
        break
      case JavelinMessageType.Spawn:
        handleSpawn(message[1], world)
        break
    }
  }

  function push(message: JavelinMessage) {
    messages.push(message)
  }

  function system(world: World) {
    for (let i = 0; i < messages.length; i++) {
      applyMessage(messages[i], world)
    }
    mutableEmpty(messages)
  }

  return {
    push,
    system,
    getLocalEntity,
    tryGetLocalEntity,
    messages,
  }
}
