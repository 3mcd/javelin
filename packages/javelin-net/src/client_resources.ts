import * as j from "@javelin/ecs"
import {ClockSyncImpl} from "./clock_sync.js"

export let ServerWorld = j.resource<j.World>()
export let ServerTime = j.resource<number>()
export let ClockSync = j.resource<ClockSyncImpl>()
export let ClockSyncRequestInterval = j.resource<number>()
export let ClockSyncRequestTime = j.resource<number>()
