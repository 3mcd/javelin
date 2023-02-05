import * as j from "@javelin/ecs";
import { Awareness as JAwareness } from "./awareness.js";
import { Transport as JTransport } from "./transport.js";

export type ClockSyncPayload = {clientTime: number; serverTime: number}
export let ClockSyncPayload = j.value<ClockSyncPayload>({
  clientTime: "f64",
  serverTime: "f64",
})
let Transport = j.value<JTransport>()
let Awareness = j.value<JAwareness>()

export let Server = j.type(Transport, ClockSyncPayload)
export let Client = j.type(Transport, Awareness, ClockSyncPayload)

export { Awareness, Transport };

