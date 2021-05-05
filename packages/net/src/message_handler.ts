import { Component, createEffect, World, WorldInternal } from "@javelin/ecs"
import {
  assert,
  ErrorType,
  Model,
  ModelNode,
  ModelNodeKind,
  mutableEmpty,
} from "@javelin/model"
import { MutArrayMethod } from "@javelin/track"
import { uint8, View } from "@javelin/pack"
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
  const tmpTraverse: number[] = []
  const tmpInsert: unknown[] = []
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
        const objectCount = bufferView.getUint8(offset)
        offset += 1
        const arrayCount = bufferView.getUint8(offset)
        offset += 1

        const component = world.storage.findComponentByComponentTypeId(
          local,
          componentTypeId,
        )

        if (!component) {
          continue
        }

        for (let i = 0; i < objectCount; i++) {
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

        for (let i = 0; i < arrayCount; i++) {
          const field = bufferView.getUint8(offset)
          offset += 1
          const traverseLength = bufferView.getUint8(offset)
          offset += 1
          mutableEmpty(tmpTraverse)
          for (let i = 0; i < traverseLength; i++) {
            tmpTraverse.push(bufferView.getUint16(offset))
            offset += 2
          }

          const arrayMethod = bufferView.getUint8(offset)
          offset += 1

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

          mutableEmpty(tmpInsert)
          switch (arrayMethod) {
            case MutArrayMethod.Pop:
              ref.pop()
              break
            case MutArrayMethod.Shift:
              ref.shift()
              break
            case MutArrayMethod.Push:
            case MutArrayMethod.Unshift:
            case MutArrayMethod.Splice:
              const insertLength = bufferView.getUint8(offset)
              offset += 1
              for (let i = 0; i < insertLength; i++) {
                tmpInsert.push(view.read(bufferView, offset))
                offset += view.byteLength
              }
            case MutArrayMethod.Push:
              ;((ref as unknown) as unknown[]).push.apply(ref, tmpInsert)
              break
            case MutArrayMethod.Unshift:
              ;((ref as unknown) as unknown[]).unshift.apply(ref, tmpInsert)
              break
            case MutArrayMethod.Splice: {
              const index = uint8.read(bufferView, offset)
              offset += 1
              const remove = uint8.read(bufferView, offset)
              offset += 1
              ;((ref as unknown) as unknown[]).splice.call(
                ref,
                index,
                remove,
                ...tmpInsert,
              )
              break
            }
          }
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

  const useInfo = createEffect(() => () => state, {
    global: true,
  })

  return {
    push,
    system,
    useInfo,
  }
}
