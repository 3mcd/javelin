import * as j from "@javelin/ecs"
import {exists, SparseSet} from "@javelin/lib"
import type {Protocol as _Protocol} from "./protocol.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

export let Protocol = j.resource<_Protocol>()

export let CommandStage = j.resource<SparseSet<TimestampBuffer>>()

export let ensureCommandBuffer = (
  commandStage: SparseSet<TimestampBuffer>,
  commandType: j.Singleton,
) => {
  let commandBuffer = commandStage.get(commandType.hash)
  if (!exists(commandBuffer)) {
    commandBuffer = new TimestampBuffer()
    commandStage.set(commandType.hash, commandBuffer)
  }
  return commandBuffer
}
