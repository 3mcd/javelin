import * as j from "@javelin/ecs"
import {Singleton, World} from "@javelin/ecs"
import {exists, Maybe, SparseSet} from "@javelin/lib"
import {stepServerWorldSystem} from "./client.js"
import {ServerWorld} from "./client_resources.js"
import {NormalizedModel} from "./model.js"
import {
  LatestSnapshotTimestamp,
  ServerSnapshots,
} from "./prediction_resources.js"
import {
  incrementTimestamp,
  makeTimestamp,
  makeTimestampFromTime,
  Timestamp,
  timestampIsLessThan,
} from "./timestamp.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

type PredictionStatus =
  | "initial"
  | "synced"
  | "awaiting_snapshot"
  | "blending"
  | "fast_forwarding"
  | "fast_forwarding_overshot"
  | "fast_forwarding_obsolete"

export let PredictionStatus = j.resource<PredictionStatus>()
/**
 * A command buffer shared by the predicted and corrected worlds.
 */
export let PredictionCommands = j.resource<SparseSet<TimestampBuffer>>()
export let CorrectedWorld = j.resource<j.World>()
export let CorrectedTimestamp = j.resource<Timestamp>()

let ensureCommandBuffer = (
  commands: SparseSet<TimestampBuffer>,
  commandType: Singleton,
) => {
  let commandBuffer = commands.get(commandType.hash)
  if (!exists(commandBuffer)) {
    commandBuffer = new TimestampBuffer()
    commands.set(commandType.hash, commandBuffer)
  }
  return commandBuffer
}

export let forwardCommandsSystem = (world: j.World) => {
  let model = world.getResource(NormalizedModel)
  let commands = world.getResource(j.Commands)
  let commandBuffers = world.getResource(PredictionCommands)
  let time = world.getResource(j.FixedTime)
  let timestamp = makeTimestamp(time.currentTime)
  for (let i = 0; i < model.commandTypes.length; i++) {
    let commandType = model.commandTypes[i]
    let commandQueue = commands.of(commandType)
    if (commandQueue.length > 0) {
      for (let i = 0; i < commandQueue.length; i++) {
        let command = commandQueue[i]
        let commandBuffer = ensureCommandBuffer(commandBuffers, commandType)
        commandBuffer.insert(command, timestamp)
      }
    }
  }
}

let updatePredictionStatusSystem = (world: j.World) => {
  let status = world.getResource(PredictionStatus)
  if (status === "initial" && world.hasResource(j.FixedTimestepTargetTime)) {
    world.setResource(PredictionStatus, "synced")
  }
  if (status === "awaiting_snapshot") {
    if (world.hasResource(LatestSnapshotTimestamp)) {
      world.setResource(PredictionStatus, "fast_forwarding")
    }
  }
}

let initWorldsSystem = (world: j.World) => {
  world.setResource(PredictionStatus, "awaiting_snapshot")
}

let applySnapshotsSystem = (world: World) => {
  let correctedWorld = world.getResource(CorrectedWorld)
  let serverSnapshots = world.getResource(ServerSnapshots).values()
  let commandBuffers = world.getResource(PredictionCommands).values()
  let latestSnapshotTimestamp: Maybe<Timestamp>

  for (let i = 0; i < serverSnapshots.length; i++) {
    let serverSnapshot = serverSnapshots[i]
    let serverSnapshotTimestamp = serverSnapshot.apply(correctedWorld)
    if (
      !exists(latestSnapshotTimestamp) ||
      serverSnapshotTimestamp > latestSnapshotTimestamp
    ) {
      latestSnapshotTimestamp = serverSnapshotTimestamp
    }
  }

  if (!exists(latestSnapshotTimestamp)) {
    return
  }

  for (let i = 0; i < commandBuffers.length; i++) {
    let commandBuffer = commandBuffers[i]
    commandBuffer.drainTo(latestSnapshotTimestamp)
  }

  world.setResource(CorrectedTimestamp, latestSnapshotTimestamp)
  world.setResource(PredictionStatus, "fast_forwarding")
}

let fastForwardSystem = (world: j.World) => {
  let serverTime = world.getResource(j.FixedTimestepTargetTime)
  let serverTimestamp = makeTimestampFromTime(serverTime, 1 / 60)
  let correctedTimestamp = world.getResource(CorrectedTimestamp)

  while (timestampIsLessThan(correctedTimestamp, serverTimestamp)) {
    // TODO: execute predicted systems

    correctedTimestamp = incrementTimestamp(correctedTimestamp)
  }

  world.setResource(CorrectedTimestamp, correctedTimestamp)
  world.setResource(PredictionStatus, "blending")
}

let blendSystem = (world: j.World) => {
  world.setResource(PredictionStatus, "awaiting_snapshot")
}

let checkpointSystem = (world: j.World) => {
  let serverTime = world.getResource(j.FixedTimestepTargetTime)
  let serverWorld = world.getResource(ServerWorld)
  let serverTimestamp = makeTimestampFromTime(serverTime, 1 / 60)
  let serverSnapshots = world.getResource(ServerSnapshots).values()
  for (let i = 0; i < serverSnapshots.length; i++) {
    let serverSnapshot = serverSnapshots[i]
    serverSnapshot.checkpoint(serverWorld, serverTimestamp)
  }
}

export let clientPredictionPlugin = (app: j.App) => {
  app
    .addResource(ServerSnapshots, new SparseSet())
    .addResource(PredictionStatus, "initial")
    .addResource(PredictionCommands, new SparseSet())
    .addResource(CorrectedWorld, new j.World())
    .addSystemToGroup(
      j.Group.LateUpdate,
      forwardCommandsSystem,
      j.after(stepServerWorldSystem),
    )
    .addSystemToGroup(j.FixedGroup.Early, updatePredictionStatusSystem)
    .addSystemToGroup(
      j.FixedGroup.Early,
      initWorldsSystem,
      j.after(updatePredictionStatusSystem),
      world => world.getResource(PredictionStatus) === "synced",
    )
    .addSystemToGroup(
      j.FixedGroup.Early,
      applySnapshotsSystem,
      j.after(initWorldsSystem),
      world => world.getResource(PredictionStatus) === "awaiting_snapshot",
    )
    .addSystemToGroup(
      j.FixedGroup.Early,
      fastForwardSystem,
      j.after(applySnapshotsSystem),
      world => world.getResource(PredictionStatus) === "fast_forwarding",
    )
    .addSystemToGroup(
      j.FixedGroup.Early,
      blendSystem,
      j.after(fastForwardSystem),
      world => world.getResource(PredictionStatus) === "blending",
    )
    .addSystemToGroup(j.FixedGroup.Late, checkpointSystem, null, world =>
      world.hasResource(j.FixedTimestepTargetTime),
    )
}
