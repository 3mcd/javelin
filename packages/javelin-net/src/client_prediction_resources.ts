import * as j from "@javelin/ecs"
import {SparseSet} from "@javelin/lib"
import {ReadStream} from "./structs/stream.js"
import {Timestamp} from "./timestamp.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

export let Snapshots = j.resource<SparseSet<TimestampBuffer<ReadStream>>>()
export let LatestSnapshotTimestamp = j.resource<Timestamp>()
