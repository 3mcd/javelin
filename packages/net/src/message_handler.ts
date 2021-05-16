import {
  $struct,
  assert,
  ErrorType,
  Model,
  ModelNode,
  SchemaKeyKind,
} from "@javelin/core"
import { Component, createEffect, World, WorldInternal } from "@javelin/ecs"
import { decode, DecodeMessageHandlers } from "./decode"

function assertWorldInternal<T>(
  world: World<T>,
): asserts world is WorldInternal<T> {}

const ERROR_PATCH_NO_MATCH =
  "Failed to patch component: reached leaf before finding field"
const ERROR_PATCH_UNSUPPORTED_TYPE =
  "Failed to patch component: only primitive types are currently supported"

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
      // const local = world.reserve()
      const local = world.spawn(...components)
      entities.set(entity, local)
    },
    onAttach(entity, components) {
      const local = entities.get(entity)
      if (local === undefined) {
        return
      }
      world.attach(local, ...components)
    },
    onUpdate(entity, components) {
      const local = entities.get(entity)
      if (local === undefined) {
        return
      }
      for (let i = 0; i < components.length; i++) {
        const source = components[i]
        const target = world.storage.findComponentBySchemaId(
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
      world.detach(local, ...schemaIds)
    },
    onDestroy(entity) {
      const local = entities.get(entity)
      if (local === undefined) {
        return
      }
      world.destroy(local)
      entities.delete(entity)
    },
    onPatch(entity, schemaId, field, traverse, value) {
      try {
        const local = entities.get(entity)
        if (local === undefined) {
          return
        }
        const component = world.storage.findComponentBySchemaId(local, schemaId)
        if (component === null) {
          return
        }
        const type = model[schemaId]
        let traverseIndex = 0
        let key: string | number | null = null
        let ref = component
        let node: ModelNode = type as ModelNode
        outer: while (node.id !== field) {
          if (key !== null) {
            ref = ref[key]
          }
          switch (node.kind) {
            case SchemaKeyKind.Primitive:
              throw new Error(ERROR_PATCH_NO_MATCH)
            case SchemaKeyKind.Array:
            case SchemaKeyKind.Object:
            case SchemaKeyKind.Set:
            case SchemaKeyKind.Map:
              key = traverse[traverseIndex++]
              node = node.edge
              continue
            case $struct:
              for (let i = 0; i < node.edges.length; i++) {
                const child = node.edges[i]
                if (child.lo <= field && child.hi >= field) {
                  key = child.key
                  node = child
                  continue outer
                }
              }
            default:
              throw new Error(ERROR_PATCH_NO_MATCH)
          }
        }
        assert(key !== null, "", ErrorType.Internal)
        assert(
          node.kind === SchemaKeyKind.Primitive,
          ERROR_PATCH_UNSUPPORTED_TYPE,
        )
        ref[key] = value
        patched.add(local)
      } catch (err) {}
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

    // const message = messages.pop()
    // if (message !== undefined) {
    //   decode(message, handlers, model)
    // }
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
