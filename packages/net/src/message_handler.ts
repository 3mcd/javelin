import { Component, createEffect, World, WorldInternal } from "@javelin/ecs"
import {
  assert,
  ErrorType,
  Model,
  ModelNode,
  ModelNodeKind,
  mutableEmpty,
} from "@javelin/model"
import { View } from "@javelin/pack"
import { decodeMessage } from "./protocol"

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
  const handlers = {
    onTick(tick: number) {
      state.remote.tick = tick
    },
    onModel(m: Model) {
      model = m
    },
    onCreate(entity: number, components: Component[]) {
      const local = world.reserve()
      world.internalSpawn(local)
      world.internalAttach(local, components)
      entities.set(entity, local)
    },
    onAttach(entity: number, components: Component[]) {
      world.internalAttach(entities.get(entity)!, components)
    },
    onUpdate(entity: number, components: Component[]) {
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
    },
    onDestroy(entity: number) {
      const local = entities.get(entity)
      if (local !== undefined) {
        world.internalDestroy(local)
        entities.delete(entity)
      }
    },
    onPatch(
      buffer: ArrayBuffer,
      bufferView: DataView,
      model: Model,
      offset: number,
    ) {
      const length = bufferView.getUint32(offset)
      const tmpTraverse: number[] = []

      offset += 4
      while (offset < length) {
        const entity = bufferView.getUint32(offset)
        const local = entities.get(entity)

        offset += 4

        if (local === undefined) {
          continue
        }

        const componentTypeId = bufferView.getUint8(offset)
        offset += 1
        const fieldsCount = bufferView.getUint8(offset)
        offset += 1

        const component = world.storage.findComponentByComponentTypeId(
          local,
          componentTypeId,
        )

        if (!component) {
          continue
        }

        for (let i = 0; i < fieldsCount; i++) {
          const field = bufferView.getUint8(offset)
          offset += 1
          const traverseLength = bufferView.getUint8(offset)
          offset += 1
          mutableEmpty(tmpTraverse)
          for (let i = 0; i < traverseLength; i++) {
            tmpTraverse.push(bufferView.getUint16(offset))
            offset += 2
          }

          const type = model[componentTypeId]
          let t = 0
          let k: string | number | null = null
          let ref = component
          let node: ModelNode = type as ModelNode

          outer: while (node.id !== field) {
            if (k !== null) {
              ref = ref[k]
            }

            switch (node.kind) {
              case ModelNodeKind.Primitive:
                throw new Error(
                  "Failed to patch component: reached leaf before finding field",
                )
              case ModelNodeKind.Array:
                k = tmpTraverse[t++]
                node = node.edge
                continue
              case ModelNodeKind.Struct:
                for (let i = 0; i < node.edges.length; i++) {
                  const child = node.edges[i]
                  if (child.lo <= field && child.hi >= field) {
                    k = child.key
                    node = child
                    continue outer
                  }
                }
              default:
                throw new Error("Failed to patch component: no possible match")
            }
          }

          assert(k !== null, "", ErrorType.Internal)
          assert(
            node.kind === ModelNodeKind.Primitive,
            "Failed to patch component: patches containing complex types are currently unsupported",
          )

          const view = node.type as View
          const value = view.read(bufferView, offset)
          offset += view.byteLength
          ref[k] = value
        }

        patched.add(local)
      }
    },
  }

  const push = (message: ArrayBuffer) => messages.unshift(message)

  const system = () => {
    let message: ArrayBuffer | undefined
    patched.clear()
    updated.clear()
    while ((message = messages.pop())) {
      decodeMessage(message, handlers, model)
    }
  }

  const effect = createEffect(() => () => state, {
    global: true,
  })

  return {
    push,
    system,
    effect,
  }
}
