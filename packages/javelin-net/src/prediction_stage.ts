import * as j from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {decodeSnapshot} from "./snapshot.js"
import {ReadStream} from "./structs/stream.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

export class PredictionSnapshotsImpl {
  readonly type
  readonly snapshots
  readonly timestamp

  constructor(type: j.Type) {
    this.snapshots = new TimestampBuffer<ReadStream>()
    this.timestamp = 0
    this.type = type
  }

  insert(snapshot: ReadStream, timestamp: number) {
    this.snapshots.insert(snapshot, timestamp)
  }

  hasSnapshot() {
    return this.snapshots.length > 0
  }

  apply(world: j.World) {
    if (this.snapshots.length === 0) {
      return
    }
    let timestamp = expect(this.snapshots.maxTimestamp)
    this.snapshots.drainAll(snapshot => {
      decodeSnapshot(world, snapshot, this.type)
    })
    return timestamp
  }
}
