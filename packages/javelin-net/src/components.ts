import * as j from "@javelin/ecs"
import type {Awareness as _Awareness} from "./awareness.js"
import type {Transport as _Transport} from "./transport.js"

export type ClockSyncPayload = {clientTime: number; serverTime: number}
export let ClockSyncPayload = j.value<ClockSyncPayload>({
  clientTime: "f64",
  serverTime: "f64",
})

export let Transport = j.value<_Transport>()
export let Awareness = j.value<_Awareness>()

export let Server = j.type(Transport, ClockSyncPayload)
export let Client = j.type(Transport, Awareness, ClockSyncPayload)
