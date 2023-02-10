import * as j from "@javelin/ecs"
import {exists, SparseSet} from "@javelin/lib"
import type {NetworkProtocol as _NetworkProtocol} from "./protocol.js"
import {
  allocTimestampBuffer,
  freeTimestampBuffer,
  TimestampBuffer,
} from "./timestamp_buffer.js"

export let NetworkProtocol = j.resource<_NetworkProtocol>()

export type CommandStage = SparseSet<TimestampBuffer>
export let CommandStage = j.resource<SparseSet<TimestampBuffer>>()
export let LastCompletedTimestamp = j.resource<number>()

export let ensureCommandBuffer = (
  commandStage: CommandStage,
  commandType: j.Singleton,
) => {
  let commandBuffer = commandStage.get(commandType.hash)
  if (!exists(commandBuffer)) {
    commandBuffer = allocTimestampBuffer()
    commandStage.set(commandType.hash, commandBuffer)
  }
  return commandBuffer
}

let commandStagePool: CommandStage[] = []

export let freeCommandStage = (commandStage: CommandStage) => {
  commandStage.each(commandBuffer => {
    freeTimestampBuffer(commandBuffer)
  })
  commandStage.clear()
  commandStagePool.push(commandStage)
}

export let allocCommandStage = (): CommandStage => {
  return commandStagePool.pop() ?? new SparseSet()
}

export let cloneCommandStage = (commandStage: CommandStage) => {
  let clone = allocCommandStage()
  commandStage.each((commandBuffer, commandTypeHash) => {
    clone.set(commandTypeHash, commandBuffer.clone())
  })
  return clone
}
