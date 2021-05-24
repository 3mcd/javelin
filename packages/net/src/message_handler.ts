import { createEffect, World } from "@javelin/ecs"
import { ModelEnhanced } from "@javelin/pack"
import { applyPatchToComponent } from "@javelin/track"
import { decode, DecodeMessageHandlers } from "./decode"

export const createMessageHandler = (world: World) => {
  let model: ModelEnhanced
  const patched = new Set<number>()
  const updated = new Set<number>()
  const state = { patched, updated }
  const entities = new Map<number, number>()
  const messages: ArrayBuffer[] = []
  const handlers: DecodeMessageHandlers = {
    onModel(m: ModelEnhanced) {
      model = m
    },
    onAttach(entity, components) {
      let local = entities.get(entity)
      if (local === undefined) {
        local = world.create()
        entities.set(entity, local)
      }
      world.attachImmediate(local, components)
    },
    onUpdate(entity, components) {
      const local = entities.get(entity)
      if (local === undefined) {
        return
      }
      for (let i = 0; i < components.length; i++) {
        const source = components[i]
        const target = world.storage.getComponentsBySchemaId(
          local,
          source.__type__,
        )

        if (target) {
          Object.assign(target, source)
        }
      }
      updated.add(local)
    },
    onDetach(entity, schemaIds) {
      const local = entities.get(entity)
      if (local === undefined) {
        return
      }
      world.detachImmediate(local, schemaIds)
    },
    onDestroy(entity) {
      const local = entities.get(entity)
      if (local === undefined) {
        return
      }
      world.destroyImmediate(local)
      entities.delete(entity)
    },
    onPatch(entity, schemaId, field, traverse, value) {
      const local = entities.get(entity)
      if (local === undefined) {
        return
      }
      const component = world.storage.getComponentsBySchemaId(local, schemaId)
      if (component === null) {
        return
      }
      applyPatchToComponent(component, field, traverse, value)
      patched.add(local)
    },
    onArrayMethod(
      entity,
      schemaId,
      method,
      field,
      traverse,
      index,
      remove,
      values,
    ) {},
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
