import * as j from "@javelin/ecs"
import {IAwareness} from "./awareness.js"
import {ITransport} from "./transport.js"

export type ClockSyncPayload = {clientTime: number; serverTime: number}
export let ClockSyncPayload = j.value<ClockSyncPayload>({
  clientTime: "f64",
  serverTime: "f64",
})
export let Transport = j.value<ITransport>()
export let Awareness = j.value<IAwareness>()
export let Client = j.type(Transport, Awareness, ClockSyncPayload)
