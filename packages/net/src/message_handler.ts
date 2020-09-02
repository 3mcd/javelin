import {
  Component,
  ComponentSpec,
  mutableEmpty,
  System,
  World,
  WorldOp,
  WorldOpType,
  $worldStorageKey,
} from "@javelin/ecs"
import {
  JavelinMessage,
  JavelinMessageType,
  Update,
  UpdateUnreliable,
} from "./protocol"

export type MessageHandler = {
  handleUnreliableUpdate(message: UpdateUnreliable, world: World): void
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

  const tmpComponentsToUpsert: Component[] = []

  function handleUnreliableUpdate(update: UpdateUnreliable, world: World) {
    const { [$worldStorageKey]: storage } = world
    const [, isLocal] = update

    let entity: number | null = null

    for (let i = 3; i < update.length; i++) {
      const value = update[i]
      const valueIsEntity = typeof value === "number"
      const valueIsFinalComponent = i === update.length - 1

      if (!valueIsEntity) {
        tmpComponentsToUpsert.push(value as Component)
      }

      if (
        // We are visiting a local entity.
        entity !== null &&
        // We are at the last component in the update.
        (valueIsFinalComponent ||
          // We are visiting a new entity.
          valueIsEntity)
      ) {
        try {
          storage.upsert(entity, tmpComponentsToUpsert)
        } catch (err) {
          // Update failed, potentially due to a race condition between reliable
          // and unreliable channels.
        }

        mutableEmpty(tmpComponentsToUpsert)
      }

      if (valueIsEntity) {
        // Attempt to locate local counterpart of remote entity.
        entity = isLocal
          ? (value as number)
          : tryGetLocalEntity(value as number)
      }
    }
  }

  function handleReliableUpdate(update: Update, world: World) {
    const [, isLocal] = update
    let i = 5
    let entity: undefined | number = isLocal
      ? (update[3] as number)
      : (remoteToLocal.get(update[3] as number) as number)
    let componentType: null | number = update[4] as number

    if (typeof entity !== "number") {
      return
    }

    while (true) {
      if (entity !== undefined && componentType !== null) {
        const path = update[i] as string
        const value = update[i + 1] as unknown

        try {
          world.patch(entity, componentType, path, value)
        } catch {
          // Entity does not exist.
        }
      }

      const maybeNextEntity = update[i + 2]
      const maybeNextComponentType = update[i + 3]

      if (
        typeof maybeNextEntity === "number" &&
        typeof maybeNextComponentType === "number"
      ) {
        const local = isLocal
          ? maybeNextEntity
          : remoteToLocal.get(maybeNextEntity)

        if (local === undefined) {
          entity = undefined
          componentType = null
          // move forward 2 indices to begin the skip
          i += 2
        } else {
          entity = local
          componentType = maybeNextComponentType
          // move forward 4 indices since we have already captured the entity and component type
          i += 4
        }

        continue
      }

      if (
        maybeNextEntity === undefined ||
        maybeNextComponentType === undefined
      ) {
        break
      }

      i += 2
    }
  }

  function getLocalEntity(opOrComponent: WorldOp | Component | number) {
    let remote: number

    if (typeof opOrComponent === "number") {
      remote = opOrComponent
    } else {
      remote = Array.isArray(opOrComponent)
        ? opOrComponent[1]
        : opOrComponent.type
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
        handleReliableUpdate(message, world)
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
      handleUnreliableUpdate(messagesUnreliable[i], world)
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
    handleUnreliableUpdate,
    getLocalEntity,
    messages: messagesReliable,
    push,
    system,
    tryGetLocalEntity,
  }
}
