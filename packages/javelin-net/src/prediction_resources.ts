import * as j from "@javelin/ecs"
import {SparseSet} from "@javelin/lib"
import {PredictionSnapshotsImpl} from "./prediction_stage.js"
import {Timestamp} from "./timestamp.js"

export let PredictedWorld = j.resource<j.World>()
export let CorrectedWorld = j.resource<j.World>()

export let SnapshotStage = j.resource<SparseSet<PredictionSnapshotsImpl>>()
export let SnapshotTimestamp = j.resource<Timestamp>()
