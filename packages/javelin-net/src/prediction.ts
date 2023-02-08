import * as j from "@javelin/ecs"
import {advanceFixedTimestepSystem} from "@javelin/ecs"
import {exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {ServerWorld} from "./client_resources.js"
import {NormalizedNetworkModel} from "./model.js"
import {
  CorrectedWorld,
  PredictedWorld,
  SnapshotStage,
  SnapshotTimestamp,
} from "./prediction_resources.js"
import {
  CommandStage,
  ensureCommandBuffer,
  LastCompletedTimestamp,
} from "./resources.js"
import {
  incrementTimestamp,
  makeTimestampFromTime,
  Timestamp,
  timestampIsEqualTo,
  timestampIsGreaterThan,
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
export let PredictionBlendProgress = j.resource<number>()

export enum PredictionGroup {
  Update = "prediction_update",
  Render = "prediction_render",
}

let makePredictionCommandsProxy = (
  world: j.World,
  commandStage: SparseSet<TimestampBuffer>,
): j.Commands => {
  let empty = [] as unknown[]
  return {
    dispatch() {
      throw new Error(
        "Failed to dispatch command: commands cannot be dispatched from a predicted system",
      )
    },
    of<T>(commandType: j.Singleton<T>): j.ComponentValue<T>[] {
      let commandTimestamp = world.getResource(LastCompletedTimestamp)
      let commandBuffer = commandStage.get(commandType.hash)
      let commandsAtTimestamp = commandBuffer?.at(commandTimestamp)
      return (commandsAtTimestamp ?? empty) as j.ComponentValue<T>[]
    },
  }
}

export let simulate = (world: j.World, systemGroup: j.SystemGroup) => {
  let timestamp = world.getResource(LastCompletedTimestamp)
  systemGroup.systems.forEach(system => {
    system.run(world)
  })
  world.setResource(LastCompletedTimestamp, incrementTimestamp(timestamp))
}

export let simulateSystem = (world: j.World) => {
  let correctedWorld = world.getResource(CorrectedWorld)
  let predictedWorld = world.getResource(PredictedWorld)
  let predictedGroup = expect(
    world.getResource(j.SystemGroups).get(PredictionGroup.Update),
  )
  if (
    timestampIsLessThan(
      predictedWorld.getResource(LastCompletedTimestamp),
      correctedWorld.getResource(LastCompletedTimestamp),
    )
  ) {
    console.warn("Predicted world is behind corrected world")
  }

  simulate(predictedWorld, predictedGroup)

  while (
    timestampIsLessThan(
      correctedWorld.getResource(LastCompletedTimestamp),
      predictedWorld.getResource(LastCompletedTimestamp),
    )
  ) {
    simulate(correctedWorld, predictedGroup)
  }

  if (
    world.getResource(PredictionStatus) === "fast_forwarding" &&
    timestampIsEqualTo(
      correctedWorld.getResource(LastCompletedTimestamp),
      predictedWorld.getResource(LastCompletedTimestamp),
    )
  ) {
    world.setResource(PredictionBlendProgress, 0)
    world.setResource(PredictionStatus, "blending")
  }
}

export let forwardCommandsSystem = (world: j.World) => {
  let model = world.getResource(NormalizedNetworkModel)
  let commands = world.getResource(j.Commands)
  let commandStage = world.getResource(CommandStage)
  let serverTime = world.getResource(j.FixedTime).currentTime
  let serverTimestamp = makeTimestampFromTime(serverTime, 1 / 60)

  for (let i = 0; i < model.commandTypes.length; i++) {
    let commandType = model.commandTypes[i]
    let commandQueue = commands.of(commandType)
    if (commandQueue.length > 0) {
      for (let i = 0; i < commandQueue.length; i++) {
        let command = commandQueue[i]
        ensureCommandBuffer(commandStage, commandType).insert(
          command,
          serverTimestamp,
        )
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
    if (world.hasResource(SnapshotTimestamp)) {
      world.setResource(PredictionStatus, "fast_forwarding")
    }
  }
}

let initWorldsSystem = (world: j.World) => {
  let time = world.getResource(j.FixedTime)
  let timestamp = makeTimestampFromTime(time.currentTime, 1 / 60)
  let predictedWorld = world.getResource(PredictedWorld)
  let correctedWorld = world.getResource(CorrectedWorld)
  predictedWorld.setResource(LastCompletedTimestamp, timestamp)
  correctedWorld.setResource(LastCompletedTimestamp, timestamp)
  world.setResource(PredictionStatus, "awaiting_snapshot")
}

let applySnapshotsSystem = (world: j.World) => {
  let snapshotStage = world.getResource(SnapshotStage).values()
  let snapshotStageHasSnapshot = false

  for (let i = 0; i < snapshotStage.length; i++) {
    if (snapshotStage[i].hasSnapshot()) {
      snapshotStageHasSnapshot = true
      break
    }
  }

  if (!snapshotStageHasSnapshot) {
    return
  }

  let correctedWorld = world.getResource(CorrectedWorld)
  let predictedWorld = world.getResource(PredictedWorld)

  world.setResource(CorrectedWorld, predictedWorld)
  world.setResource(PredictedWorld, correctedWorld)

  predictedWorld = world.getResource(PredictedWorld)
  correctedWorld = world.getResource(CorrectedWorld)

  let commandBuffers = world.getResource(CommandStage).values()

  let latestSnapshotTimestamp: Maybe<Timestamp>

  for (let i = 0; i < snapshotStage.length; i++) {
    let serverSnapshot = snapshotStage[i]
    let serverSnapshotTimestamp = serverSnapshot.apply(correctedWorld)
    if (!exists(serverSnapshotTimestamp)) {
      continue
    }
    if (
      !exists(latestSnapshotTimestamp) ||
      timestampIsGreaterThan(serverSnapshotTimestamp, latestSnapshotTimestamp)
    ) {
      latestSnapshotTimestamp = serverSnapshotTimestamp
    }
  }

  for (let i = 0; i < commandBuffers.length; i++) {
    commandBuffers[i].drainTo(expect(latestSnapshotTimestamp))
  }

  correctedWorld.setResource(LastCompletedTimestamp, latestSnapshotTimestamp)

  world.setResource(PredictionStatus, "fast_forwarding")
}

let blendSystem = (world: j.World) => {
  let currBlendProgress = world.getResource(PredictionBlendProgress)
  if (currBlendProgress >= 1) {
    world.setResource(PredictionStatus, "awaiting_snapshot")
  } else {
    let nextBlendProgress = Math.min(1, currBlendProgress + 0.2)
    world.setResource(PredictionBlendProgress, nextBlendProgress)
  }
}

let checkpointSystem = (world: j.World) => {
  let serverTime = world.getResource(j.FixedTime)
  let serverTimestamp = makeTimestampFromTime(serverTime.currentTime, 1 / 60)
  let serverWorld = world.getResource(ServerWorld)
  let snapshotStage = world.getResource(SnapshotStage).values()
  for (let i = 0; i < snapshotStage.length; i++) {
    let serverSnapshot = snapshotStage[i]
    serverSnapshot.checkpoint(serverWorld, serverTimestamp)
  }
}

export let clientPredictionPlugin = (app: j.App) => {
  let predictedWorld = expect(app.getResource(ServerWorld))
  let correctedWorld = new j.World()
  let commandStage = new SparseSet<TimestampBuffer>()
  predictedWorld.setResource(
    j.Commands,
    makePredictionCommandsProxy(predictedWorld, commandStage),
  )
  correctedWorld.setResource(
    j.Commands,
    makePredictionCommandsProxy(correctedWorld, commandStage),
  )
  app
    .addResource(PredictionStatus, "initial")
    .addResource(PredictionBlendProgress, 0)
    .addResource(SnapshotStage, new SparseSet())
    .addResource(CommandStage, commandStage)
    .addResource(PredictedWorld, predictedWorld)
    .addResource(CorrectedWorld, correctedWorld)
    .addSystemGroup(PredictionGroup.Update, null, () => false)
    .addSystemGroup(
      PredictionGroup.Render,
      j
        .after<j.FixedGroup | j.Group>(j.FixedGroup.LateUpdate)
        .before(j.Group.Late),
      world =>
        world.getResource(PredictionStatus) === "blending" ||
        world.getResource(PredictionStatus) === "awaiting_snapshot" ||
        world.getResource(PredictionStatus) === "fast_forwarding",
    )

    .addSystemToGroup(j.FixedGroup.Early, updatePredictionStatusSystem)
    .addSystemToGroup(
      j.Group.Early,
      initWorldsSystem,
      j.after(advanceFixedTimestepSystem),
      world => world.getResource(PredictionStatus) === "synced",
    )
    .addSystemToGroup(
      j.FixedGroup.EarlyUpdate,
      applySnapshotsSystem,
      null,
      world => world.getResource(PredictionStatus) === "awaiting_snapshot",
    )
    .addSystemToGroup(
      j.FixedGroup.Update,
      forwardCommandsSystem,
      null,
      world => world.getResource(PredictionStatus) !== "initial",
    )
    // Continuously step the `PredictedWorld` and `CorrectedWorld`.
    .addSystemToGroup(
      j.FixedGroup.Update,
      simulateSystem,
      j.after(forwardCommandsSystem),
      world =>
        world.getResource(PredictionStatus) !== "initial" &&
        world.getResource(PredictionStatus) !== "synced",
    )
    // .addSystemToGroup(j.FixedGroup.Late, checkpointSystem, null, world =>
    //   world.hasResource(j.FixedTimestepTargetTime),
    // )
    .addSystemToGroup(
      j.Group.LateUpdate,
      blendSystem,
      null,
      world => world.getResource(PredictionStatus) === "blending",
    )
}
