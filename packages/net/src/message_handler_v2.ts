import {
  Component,
  createEffect,
  ref,
  World,
  WorldInternal,
} from "@javelin/ecs"
import { decodeMessage, DecodeMessageHandlers, Model } from "./protocol_v2"

function isWorldInternal<T>(world: World<T>): world is WorldInternal<T> {
  return true
}

export const remote = createEffect(() => () => ref({ tick: -1 }), {
  global: true,
})

export const createMessageHandler = (
  world: World,
  handlers: Partial<DecodeMessageHandlers> = {},
) => {
  if (!isWorldInternal(world)) {
    throw new Error()
  }

  let model: Model
  const entities = new Map<number, number>()
  const messages: ArrayBuffer[] = []
  const messageHandlers = {
    onTick(tick: number) {},
    onModel(nextModel: Model) {
      model = nextModel
    },
    onCreate(entity: number, components: Component[]) {
      const local = world.reserve()
      world.internalSpawn(local)
      world.internalAttach(local, components)
      entities.set(entity, local)
      handlers.onCreate?.(entity, components)
    },
    onAttach(entity: number, components: Component[]) {
      world.internalAttach(entities.get(entity)!, components)
      handlers.onAttach?.(entity, components)
    },
    onUpdate(entity: number, components: Component[]) {
      for (let i = 0; i < components.length; i++) {
        const local = entities.get(entity)!
        const source = components[i]
        const target = world.storage.findComponentByComponentTypeId(
          local,
          source._tid,
        )

        if (target) {
          Object.assign(target, source)
        }
      }

      handlers.onUpdate?.(entity, components)
    },
    onDetach(entity: number, componentTypeIds: number[]) {
      const local = entities.get(entity)!
      const components: Component[] = []
      for (let i = 0; i < componentTypeIds.length; i++) {
        const component = world.storage.findComponentByComponentTypeId(
          local,
          componentTypeIds[i],
        )
        if (component !== null) {
          components.push(component)
        }
      }
      world.internalDetach(local, components)
      handlers.onDetach?.(entity, componentTypeIds)
    },
    onDestroy(entity: number) {
      world.internalDestroy(entities.get(entity)!)
      handlers.onDestroy?.(entity)
    },
  }

  const push = (message: ArrayBuffer) => {
    messages.push(message)
  }

  const system = () => {
    let message: ArrayBuffer | undefined
    while ((message = messages.pop())) {
      decodeMessage(message, messageHandlers, model)
    }
  }

  return {
    push,
    system,
  }
}
