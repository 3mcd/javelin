import {
  Component,
  createEffect,
  ref,
  World,
  WorldInternal,
} from "@javelin/ecs"
import { Model, patch } from "@javelin/model"
import { uint32, uint8 } from "@javelin/pack"
import { decodeMessage, DecodeMessageHandlers } from "./protocol"

function assertWorldInternal<T>(
  world: World<T>,
): asserts world is WorldInternal<T> {}

export const createMessageHandler = (
  world: World,
  handlers: Partial<DecodeMessageHandlers> = {},
) => {
  assertWorldInternal(world)
  let model: Model
  const remote = { tick: -1 }
  const entities = new Map<number, number>()
  const messages: ArrayBuffer[] = []
  const messageHandlers = {
    onTick(tick: number) {
      remote.tick = tick
    },
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
    onPatch(
      buffer: ArrayBuffer,
      bufferView: DataView,
      model: Model,
      offset: number,
    ) {
      // while (offset < buffer.byteLength) {
      //   const entity = uint32.read(bufferView, (offset += uint32.byteLength))
      //   const componentId = uint8.read(bufferView, (offset += uint8.byteLength))
      //   const fieldId = uint8.read(bufferView, (offset += uint8.byteLength))
      //   const component = world.storage.findComponentByComponentTypeId(entity, componentId)
      //   patch(model, componentId, fieldId, )
      // }
    },
  }

  const push = (message: ArrayBuffer) => messages.unshift(message)

  const system = () => {
    let message: ArrayBuffer | undefined
    while ((message = messages.pop())) {
      decodeMessage(message, messageHandlers, model)
    }
  }

  const effect = createEffect(() => () => ref({ tick: -1 }), {
    global: true,
  })

  return {
    push,
    system,
    effect,
  }
}
