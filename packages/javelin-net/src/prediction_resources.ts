import * as j from "@javelin/ecs"
import {SparseSet} from "@javelin/lib"
import {PredictionSnapshotsImpl} from "./prediction_snapshots.js"
import {Timestamp} from "./timestamp.js"

export let ServerSnapshots = j.resource<SparseSet<PredictionSnapshotsImpl>>()
export let LatestSnapshotTimestamp = j.resource<Timestamp>()
