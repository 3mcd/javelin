import * as j from "@javelin/ecs"
import {exists, SparseSet} from "@javelin/lib"
import {decodeSnapshot} from "./snapshot.js"
import {ReadStream} from "./structs/stream.js"
import {makeTimestamp, Timestamp} from "./timestamp.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

type ComponentSet = unknown[]

type PredictionCheckpoint = SparseSet<ComponentSet>

export class PredictionSnapshotsImpl {
  readonly type
  readonly snapshots
  readonly timestamp
  readonly checkpoints
  readonly checkpointPool

  constructor(type: j.Type) {
    this.checkpointPool = [] as PredictionCheckpoint[]
    this.checkpoints = new TimestampBuffer<PredictionCheckpoint>()
    this.snapshots = new TimestampBuffer<ReadStream>()
    this.timestamp = makeTimestamp()
    this.type = type
  }

  insert(snapshot: ReadStream, timestamp: Timestamp) {
    this.snapshots.setTimestamp(timestamp)
    this.checkpoints.setTimestamp(timestamp)
    this.snapshots.insert(snapshot, timestamp)
  }

  checkpoint(world: j.World, timestamp: Timestamp) {
    let checkpoint = this.checkpointPool.pop() ?? new SparseSet()
    for (let i = 0; i < this.type.components.length; i++) {
      let component = this.type.components[i]
      if (!checkpoint.has(component)) {
        checkpoint.set(component, [])
      }
    }
    world.query(this.type).each(entity => {
      for (let i = 0; i < this.type.components.length; i++) {
        let component = this.type.components[i]
        let componentStore = world[j._getComponentStore](component)
        let componentValues = checkpoint.get(entity)!
        if (!exists(componentValues)) {
          componentValues = []
          checkpoint.set(entity, componentValues)
        }
        let componentValue = componentValues[component]
        if (exists(componentValue)) {
          Object.assign(componentValue as any, componentStore[entity])
        } else {
          componentValues[component] = structuredClone(componentStore[entity])
        }
      }
    })
    this.checkpoints.insert(checkpoint, timestamp)
  }

  apply(world: j.World) {
    let timestamp = this.snapshots.maxTimestamp ?? makeTimestamp()
    let checkpoint = this.checkpoints.at(timestamp)
    this.checkpoints.drainTo(timestamp, checkpoint => {
      this.checkpointPool.push(checkpoint)
    })
    if (exists(checkpoint)) {
      let entities = checkpoint[0].keys()
      let entityCheckpoints = checkpoint[0].values()
      for (let i = 0; i < entityCheckpoints.length; i++) {
        let entity = entities[i]
        let entityCheckpoint = entityCheckpoints[i]
        for (let k = 0; k < this.type.components.length; k++) {
          let component = this.type.components[k]
          let componentStore = world[j._getComponentStore](component)
          let componentValue = entityCheckpoint[component]
          if (exists(componentValue)) {
            componentStore[entity] = componentValue
          }
        }
      }
    }
    this.snapshots.drainTo(timestamp, snapshot => {
      decodeSnapshot(world, snapshot, this.type)
    })
    return timestamp
  }
}
