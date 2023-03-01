import * as j from "@javelin/ecs"
import {assert, exists, expect, SparseSet} from "@javelin/lib"
import {Display, initDisplay} from "./prediction_display.js"
import {decodeSnapshot} from "./snapshot.js"
import {ReadStream} from "./structs/stream.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

export type PredictionDisplay = SparseSet<unknown>[]

export type PredictionScope = {
  readonly type: j.Type
  readonly entities: Set<j.Entity>
  readonly snapshots: TimestampBuffer<ReadStream>
}

export let makePredictionScope = (type: j.Type): PredictionScope => {
  return {
    entities: new Set(),
    snapshots: new TimestampBuffer(),
    type,
  }
}

export let applySnapshots = (
  scope: PredictionScope,
  world: j.World,
  entities: Set<j.Entity>,
) => {
  assert(scope.snapshots.length > 0)
  let step = expect(scope.snapshots.maxTimestamp)
  scope.snapshots.drainAll(snapshot => {
    decodeSnapshot(world, snapshot, scope.type, entities)
  })
  return step
}

export let updateDisplay = (
  scope: PredictionScope,
  world: j.World,
  display: Display,
) => {
  initDisplay(display, scope.type)
  world.query(scope.type).each(entity => {
    for (let i = 0; i < scope.type.components.length; i++) {
      let component = scope.type.components[i]
      let componentStore = world[j._getComponentStore](component)
      let componentValue = componentStore[entity]
      let componentDisplayArray = expect(display[component])
      let componentDisplayValue = componentDisplayArray.get(entity)
      if (exists(componentDisplayValue)) {
        Object.assign(componentDisplayValue as {}, componentValue)
      } else {
        componentDisplayArray.set(entity, structuredClone(componentValue))
      }
    }
  })
}
