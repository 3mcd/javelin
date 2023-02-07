import * as j from "@javelin/ecs"
import {exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {stepServerWorldSystem} from "./client.js"
import {ServerWorld} from "./client_resources.js"
import {NormalizedModel} from "./model.js"
import {
  CorrectedWorld,
  LatestSnapshotTimestamp,
  PredictionRenderWorld,
  PredictionStage,
} from "./prediction_resources.js"
import {
  incrementTimestamp,
  makeTimestampFromTime,
  Timestamp,
  timestampIsLessThanOrEqualTo,
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
export let PredictionCommands = j.resource<SparseSet<TimestampBuffer>>()
export let PredictionBlendProgress = j.resource<number>()
export let CorrectedTimestamp = j.resource<Timestamp>()

export enum PredictionGroup {
  Update = "prediction_update",
  Render = "prediction_render",
}

let makePredictionCommands = (world: j.World): j.Commands => {
  let empty = [] as unknown[]
  return {
    dispatch(commandType: j.Singleton, command: unknown) {
      // TODO: not sure what to do here yet
    },
    of<T>(commandType: j.Singleton<T>): j.ComponentValue<T>[] {
      let commands = world.getResource(PredictionCommands)
      return (commands
        .get(commandType.hash)
        ?.at(world.getResource(CorrectedTimestamp)) ??
        empty) as j.ComponentValue<T>[]
    },
  }
}

let ensureCommandBuffer = (
  commands: SparseSet<TimestampBuffer>,
  commandType: j.Singleton,
) => {
  let commandBuffer = commands.get(commandType.hash)
  if (!exists(commandBuffer)) {
    commandBuffer = new TimestampBuffer()
    commands.set(commandType.hash, commandBuffer)
  }
  return commandBuffer
}

export let simulateSystem = (world: j.World) => {
  let serverWorld = world.getResource(ServerWorld)
  let predictionSystemGroup = expect(
    world.getResource(j.SystemGroups).get(PredictionGroup.Update),
  )
  predictionSystemGroup.systems.forEach(system => {
    if (system.isEnabled(serverWorld)) {
      system.run(serverWorld)
    }
  })
}

export let forwardCommandsSystem = (world: j.World) => {
  let model = world.getResource(NormalizedModel)
  let commands = world.getResource(j.Commands)
  let commandBuffers = world.getResource(PredictionCommands)
  let serverTime = world.getResource(j.FixedTimestepTargetTime)
  let serverTimestamp = makeTimestampFromTime(serverTime, 1 / 60)

  for (let i = 0; i < model.commandTypes.length; i++) {
    let commandType = model.commandTypes[i]
    let commandQueue = commands.of(commandType)
    if (commandQueue.length > 0) {
      for (let i = 0; i < commandQueue.length; i++) {
        let command = commandQueue[i]
        let commandBuffer = ensureCommandBuffer(commandBuffers, commandType)
        commandBuffer.insert(command, serverTimestamp)
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

let applySnapshotsSystem = (world: j.World) => {
  let correctedWorld = world.getResource(CorrectedWorld)
  let predictionStage = world.getResource(PredictionStage).values()
  let commandBuffers = world.getResource(PredictionCommands).values()
  let latestSnapshotTimestamp: Maybe<Timestamp>

  for (let i = 0; i < predictionStage.length; i++) {
    let serverSnapshot = predictionStage[i]
    let serverSnapshotTimestamp = serverSnapshot.apply(correctedWorld)
    if (!exists(serverSnapshotTimestamp)) {
      continue
    }
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
    commandBuffer.drainTo(incrementTimestamp(latestSnapshotTimestamp))
  }

  world.setResource(CorrectedTimestamp, latestSnapshotTimestamp)
  world.setResource(PredictionStatus, "fast_forwarding")
}

let fastForwardSystem = (world: j.World) => {
  let serverTime = world.getResource(j.FixedTimestepTargetTime)
  let serverTimestamp = makeTimestampFromTime(serverTime, 1 / 60)
  let correctedTimestamp = world.getResource(CorrectedTimestamp)
  let correctedWorld = world.getResource(CorrectedWorld)
  let predictionSystemGroup = expect(
    world.getResource(j.SystemGroups).get(PredictionGroup.Update),
  )
  // console.log(
  //   `fast-forwarding to ${serverTimestamp} from ${correctedTimestamp} (${
  //     serverTimestamp - correctedTimestamp
  //   } steps)`,
  // )
  while (timestampIsLessThanOrEqualTo(correctedTimestamp, serverTimestamp)) {
    predictionSystemGroup.systems.forEach(system => {
      if (system.isEnabled(correctedWorld)) {
        system.run(correctedWorld)
      }
    })
    correctedTimestamp = incrementTimestamp(correctedTimestamp)
  }

  world.setResource(CorrectedTimestamp, correctedTimestamp)
  world.setResource(PredictionBlendProgress, 0)
  world.setResource(PredictionRenderWorld, world.getResource(CorrectedWorld))
  world.setResource(PredictionStatus, "blending")
}

let blendSystem = (world: j.World) => {
  let currBlendProgress = world.tryGetResource(PredictionBlendProgress) ?? 0
  if (currBlendProgress >= 1) {
    world.setResource(PredictionRenderWorld, world.getResource(ServerWorld))
    world.setResource(PredictionStatus, "awaiting_snapshot")
  } else {
    let nextBlendProgress = Math.min(1, currBlendProgress + 0.2)
    world.setResource(PredictionBlendProgress, nextBlendProgress)
  }
}

let checkpointSystem = (world: j.World) => {
  let correctedWorld = world.getResource(CorrectedWorld)
  let correctedTimestamp = world.getResource(CorrectedTimestamp)
  let predictionStage = world.getResource(PredictionStage).values()
  for (let i = 0; i < predictionStage.length; i++) {
    let serverSnapshot = predictionStage[i]
    serverSnapshot.checkpoint(correctedWorld, correctedTimestamp)
  }
}

export let clientPredictionPlugin = (app: j.App) => {
  let correctedWorld = new j.World()
  correctedWorld.setResource(j.Commands, makePredictionCommands(app.world))
  app
    .getResource(ServerWorld)
    ?.setResource(j.Commands, app.getResource(j.Commands))
  app
    .addResource(PredictionStage, new SparseSet())
    .addResource(PredictionStatus, "initial")
    .addResource(PredictionCommands, new SparseSet())
    .addResource(CorrectedWorld, correctedWorld)
    .addSystemGroup(PredictionGroup.Update, null, () => false)
    .addSystemGroup(
      PredictionGroup.Render,
      j.after(j.Group.LateUpdate),
      world =>
        world.getResource(PredictionStatus) === "blending" ||
        world.getResource(PredictionStatus) === "awaiting_snapshot" ||
        world.getResource(PredictionStatus) === "fast_forwarding",
    )
    .addSystemToGroup(
      j.Group.LateUpdate,
      forwardCommandsSystem,
      j.after(stepServerWorldSystem),
      world => world.getResource(PredictionStatus) !== "initial",
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
      simulateSystem,
      j.after(applySnapshotsSystem),
    )
    .addSystemToGroup(
      j.FixedGroup.Early,
      fastForwardSystem,
      j.after(applySnapshotsSystem),
      world => world.getResource(PredictionStatus) === "fast_forwarding",
    )
    .addSystemToGroup(
      j.Group.LateUpdate,
      blendSystem,
      null,
      world => world.getResource(PredictionStatus) === "blending",
    )
    .addSystemToGroup(j.FixedGroup.Late, checkpointSystem, null, world =>
      world.hasResource(j.FixedTimestepTargetTime),
    )
}
