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
import {
  JavelinMessage,
  JavelinMessageType,
  UpdateUnreliable,
} from "./protocol"

export type MessageHandler = {
  applyUnreliableUpdate(message: UpdateUnreliable, world: World): void
  getLocalEntity(remoteEntity: number): number
  messages: ReadonlyArray<JavelinMessage>
  push(message: JavelinMessage): void
  system: System<unknown>
  tryGetLocalEntity(remoteEntity: number): number | null
}

export type MessageHandlerOptions = {
  processUnreliableUpdates?(updates: UpdateUnreliable[], world: World): unknown
}

export function createMessageHandler(
  options: MessageHandlerOptions = {},
): MessageHandler {
  const messagesReliable: JavelinMessage[] = []
  const messagesUnreliable: UpdateUnreliable[] = []
  const remoteToLocal = new Map<number, number>()
  const toStopTracking = new Set<number>()

  function handleOps(ops: WorldOp[], isLocal: boolean, world: World) {
    if (!isLocal) {
      let i = 0

      while (i < ops.length) {
        const op = ops[i]

        let local: number

        if (op[0] === WorldOpType.Spawn) {
          local = world.spawn(...op[2])
          remoteToLocal.set(op[1], local)
          ops.splice(i, 1)
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

    world.applyOps(ops)
  }

  function applyUnreliableUpdate(
    updateMessage: UpdateUnreliable,
    world: World,
  ) {
    handleUpdate(updateMessage[1], updateMessage[2], world)
  }

  function handleUpdate(
    entityComponentPairs: [number, Component[]][],
    isLocal: boolean,
    world: World,
  ) {
    const { [$worldStorageKey]: storage } = world

    // Attempt to update or insert each component.
    for (let i = 0; i < entityComponentPairs.length; i++) {
      const [entity, components] = entityComponentPairs[i]
      const local = isLocal ? entity : tryGetLocalEntity(entity)

      // Entity was removed prior to processing this update.
      if (local === null) {
        continue
      }

      try {
        storage.upsert(local, components)
      } catch (err) {
        // Update failed, potentially due to a race condition between reliable
        // and unreliable channels.
        return
      }
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
    world.spawn(...components)
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

  const defaultProcessUnreliableUpdates = (
    messagesUnreliable: UpdateUnreliable[],
    world: World,
  ) => {
    for (let i = 0; i < messagesUnreliable.length; i++) {
      const message = messagesUnreliable[i]
      handleUpdate(message[1], message[2], world)
    }
  }

  const processUnreliableUpdates =
    options.processUnreliableUpdates || defaultProcessUnreliableUpdates

  function push(message: JavelinMessage) {
    ;(message[0] === JavelinMessageType.UpdateUnreliable
      ? messagesUnreliable
      : messagesReliable
    ).push(message)
  }

  function system(world: World) {
    for (let i = 0; i < messagesReliable.length; i++) {
      applyMessage(messagesReliable[i], world)
    }

    processUnreliableUpdates(messagesUnreliable, world)

    mutableEmpty(messagesReliable)
    mutableEmpty(messagesUnreliable)
  }

  return {
    applyUnreliableUpdate,
    getLocalEntity,
    messages: messagesReliable,
    push,
    system,
    tryGetLocalEntity,
  }
}
