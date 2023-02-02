import * as j from "@javelin/ecs"
import {SparseSet} from "@javelin/lib"
import {Awareness} from "./awareness.js"
import {Transport} from "./transport.js"

export type ClockSyncPayload = {clientTime: number; serverTime: number}
export let ClockSyncPayload = j.value<ClockSyncPayload>({
  clientTime: "f64",
  serverTime: "f64",
})
let Transport = j.value<Transport>()
let Awareness = j.value<Awareness>()
export let Commands = j.value<SparseSet<unknown[]>>()
export let Client = j.type(Transport, Awareness, ClockSyncPayload)

export {Awareness, Transport}
