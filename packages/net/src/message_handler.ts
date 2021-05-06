import { Component, createEffect, World, WorldInternal } from "@javelin/ecs"
import { Model } from "@javelin/model"
import { decode, DecodeMessageHandlers } from "./decode"

function assertWorldInternal<T>(
  world: World<T>,
): asserts world is WorldInternal<T> {}

export const createMessageHandler = (world: World) => {
  assertWorldInternal(world)
  let model: Model
  const patched = new Set<number>()
  const updated = new Set<number>()
  const state = { remote: { tick: -1 }, patched, updated }
  const entities = new Map<number, number>()
  const messages: ArrayBuffer[] = []
  const handlers: DecodeMessageHandlers = {
    onTick(tick) {
      state.remote.tick = tick
    },
    onModel(m) {
      model = m
    },
    onSpawn(entity, components) {
      const local = world.reserve()
      world.internalSpawn(local)
      world.internalAttach(local, components)
      entities.set(entity, local)
    },
    onAttach(entity, components) {
      world.internalAttach(entities.get(entity)!, components)
    },
    onUpdate(entity, components) {
      for (let i = 0; i < components.length; i++) {
        const local = entities.get(entity)!
        const source = components[i]
        const target = world.storage.findComponentByComponentTypeId(
          local,
          source.__type__,
        )

        if (target) {
          Object.assign(target, source)
        }

        updated.add(local)
      }
    },
    onDetach(entity, componentTypeIds) {
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
    },
    onDestroy(entity) {
      const local = entities.get(entity)
      if (local !== undefined) {
        world.internalDestroy(local)
        entities.delete(entity)
      }
    },
    onPatch(entity, field, traverse, value) {},
    onArrayMethod(entity, method, field, traverse, index, remove, values) {},
  }

  const push = (message: ArrayBuffer) => messages.unshift(message)

  const system = () => {
    let message: ArrayBuffer | undefined
    patched.clear()
    updated.clear()
    while ((message = messages.pop())) {
      decode(message, handlers, model)
    }
  }

  const useInfo = createEffect(() => () => state, {
    global: true,
  })

  return {
    push,
    system,
    useInfo,
  }
}
