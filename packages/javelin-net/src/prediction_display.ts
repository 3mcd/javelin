import * as j from "@javelin/ecs"
import {_getComponentStore} from "@javelin/ecs"
import {exists, expect, SparseSet} from "@javelin/lib"
import {
  NormalizedPredictionConfig,
  PredictionConfig,
} from "./prediction_resources"

export type Display = SparseSet<unknown>[]

let displayPool = [] as Display[]

export let allocDisplay = (): Display => {
  return displayPool.pop() || []
}

export let freeDisplay = (display: Display) => {
  displayPool.push(display)
}

export let initDisplay = (display: Display, type: j.Type) => {
  for (let i = 0; i < type.components.length; i++) {
    let component = type.components[i]
    let sparse = display[component]
    if (exists(sparse)) {
      // sparse.clear()
    } else {
      sparse = new SparseSet()
      display[component] = sparse
    }
  }
}

export let createDisplay = (world: j.World, type: j.Type) => {
  let display = allocDisplay()
  initDisplay(display, type)
  world.query(type).each(entity => {
    for (let i = 0; i < type.components.length; i++) {
      let component = type.components[i]
      let componentArray = expect(display[component])
      let componentValue = componentArray.get(entity)
      if (exists(componentValue)) {
        Object.assign(
          componentValue as {},
          world[_getComponentStore](component)[entity],
        )
      } else {
        componentArray.set(
          entity,
          structuredClone(world[_getComponentStore](component)[entity]),
        )
      }
    }
  })
  return display
}

export let blendDisplays = (
  type: j.Type,
  oldDisplay: Display,
  newDisplay: Display,
  blendedDisplay = allocDisplay(),
  alpha: number,
  config: NormalizedPredictionConfig,
) => {
  for (let i = 0; i < type.components.length; i++) {
    let component = type.components[i]
    let prev = oldDisplay[component]
    let next = newDisplay[component]
    if (!exists(next)) {
      continue
    }
    let blendedSparse = blendedDisplay[component]
    if (!exists(blendedSparse)) {
      blendedSparse = new SparseSet()
      blendedDisplay[component] = blendedSparse
    }
    if (exists(prev)) {
      const blend = config.components[component]?.blend
      if (exists(blend)) {
        next.each((newValue, entity) => {
          let oldValue = prev.get(entity)
          if (exists(oldValue)) {
            let blendedValue = blendedSparse.get(entity) ?? j.express(component)
            blend(oldValue, newValue, blendedValue, alpha)
            blendedSparse.set(entity, blendedValue)
          } else {
            blendedSparse.set(entity, newValue)
          }
        })
      } else {
        next.each((newValue, entity) => {
          blendedSparse.set(entity, newValue)
        })
      }
    }
  }
  return blendedDisplay
}
