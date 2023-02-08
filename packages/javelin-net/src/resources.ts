import * as j from "@javelin/ecs"
import {exists, SparseSet} from "@javelin/lib"
import type {NetworkProtocol as _NetworkProtocol} from "./protocol.js"
import {Timestamp} from "./timestamp.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

export let NetworkProtocol = j.resource<_NetworkProtocol>()

export let CommandStage = j.resource<SparseSet<TimestampBuffer>>()
export let LastCompletedTimestamp = j.resource<Timestamp>()

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
