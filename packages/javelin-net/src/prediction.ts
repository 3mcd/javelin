import * as j from "@javelin/ecs"
import {advanceFixedTimestepSystem} from "@javelin/ecs"
import {exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {ServerWorld} from "./client_resources.js"
import {MAX_STEPS_PER_FRAME} from "./const.js"
import {NormalizedNetworkModel} from "./model.js"
import {
  CorrectedWorld,
  PredictedWorld,
  SnapshotStage,
} from "./prediction_resources.js"
import {
  allocCommandStage,
  cloneCommandStage,
  CommandStage,
  ensureCommandBuffer,
  freeCommandStage,
  LastCompletedTimestamp,
} from "./resources.js"
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
export let BlendStartFrame = j.resource<number>()

let CorrectedEntities = j.resource<Set<j.Entity>>()

export enum PredictionGroup {
  Update = "prediction_update",
  Render = "prediction_render",
}

let makePredictionCommandsProxy = (world: j.World): j.Commands => {
  return {
    dispatch() {
      throw new Error(
        "Failed to dispatch command: commands cannot be dispatched from a predicted system",
      )
    },
    of<T>(commandType: j.Singleton<T>, iteratee: j.CommandsOfIteratee<T>) {
      let commandStage = world.getResource(CommandStage)
      let commandBuffer = commandStage.get(commandType.hash)
      let prevTimestamp = world.getResource(LastCompletedTimestamp)
      let currTimestamp = prevTimestamp + 1
      ;(
        commandBuffer as Maybe<TimestampBuffer<j.ComponentValue<T>>>
      )?.forEachUpTo(currTimestamp, iteratee)
    },
  }
}

let swapPredictionWorlds = (world: j.World) => {
  let predictedWorld = world.getResource(PredictedWorld)
  let correctedWorld = world.getResource(CorrectedWorld)
  world.setResource(CorrectedWorld, predictedWorld)
  world.setResource(PredictedWorld, correctedWorld)
}

let stepPredictionWorld = (world: j.World, systemGroup: j.SystemGroup) => {
  let prevTimestamp = world.getResource(LastCompletedTimestamp)
  let currTimestamp = prevTimestamp + 1
  systemGroup.systems.forEach(system => {
    system.run(world)
  })
  world.setResource(LastCompletedTimestamp, currTimestamp)
  let commandStage = world.getResource(CommandStage)
  let commandBuffers = commandStage.values()
  for (let i = 0; i < commandBuffers.length; i++) {
    commandBuffers[i].drainTo(currTimestamp)
  }
}

export let stepPredictionWorldsSystem = (world: j.World) => {
  let correctedWorld = world.getResource(CorrectedWorld)
  let predictedWorld = world.getResource(PredictedWorld)
  let predictedSystemGroup = expect(
    world.getResource(j.SystemGroups).get(PredictionGroup.Update),
  )
  if (
    predictedWorld.getResource(LastCompletedTimestamp) <
    correctedWorld.getResource(LastCompletedTimestamp)
  ) {
    console.warn("Predicted world is behind corrected world")
  }

  stepPredictionWorld(predictedWorld, predictedSystemGroup)

  let i = 0

  while (
    correctedWorld.getResource(LastCompletedTimestamp) <
      predictedWorld.getResource(LastCompletedTimestamp) &&
    i++ < MAX_STEPS_PER_FRAME
  ) {
    stepPredictionWorld(correctedWorld, predictedSystemGroup)
  }

  if (
    world.getResource(PredictionStatus) === "fast_forwarding" &&
    correctedWorld.getResource(LastCompletedTimestamp) ===
      predictedWorld.getResource(LastCompletedTimestamp)
  ) {
    world.setResource(PredictionBlendProgress, 0)
    world.setResource(PredictionStatus, "blending")
    world.setResource(
      BlendStartFrame,
      correctedWorld.getResource(LastCompletedTimestamp),
    )
  }
}

export let forwardCommandsSystem = (world: j.World) => {
  let model = world.getResource(NormalizedNetworkModel)
  let commands = world.getResource(j.Commands)
  let commandStage = world.getResource(CommandStage)
  let commandTimestamp = world.getResource(j.FixedStep)
  let predictedCommandStage = world
    .getResource(PredictedWorld)
    .getResource(CommandStage)
  let correctedCommandStage = world
    .getResource(CorrectedWorld)
    .getResource(CommandStage)

  for (let i = 0; i < model.commandTypes.length; i++) {
    let commandType = model.commandTypes[i]
    commands.of(commandType, command => {
      ensureCommandBuffer(commandStage, commandType).insert(
        command,
        commandTimestamp,
      )
      ensureCommandBuffer(predictedCommandStage, commandType).insert(
        command,
        commandTimestamp,
      )
      ensureCommandBuffer(correctedCommandStage, commandType).insert(
        command,
        commandTimestamp,
      )
    })
  }
}

let updatePredictionStatusSystem = (world: j.World) => {
  let status = world.getResource(PredictionStatus)
  if (status === "initial" && world.hasResource(j.FixedTimestepTargetTime)) {
    world.setResource(PredictionStatus, "synced")
  }
}

let initWorldsSystem = (world: j.World) => {
  let timestamp = world.getResource(j.FixedStep)
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

  swapPredictionWorlds(world)

  let predictedWorld = world.getResource(CorrectedWorld)
  let correctedWorld = world.getResource(CorrectedWorld)
  let commandStage = world.getResource(CommandStage)
  let commandBuffers = commandStage.values()
  let latestSnapshotTimestamp: Maybe<number>

  predictedWorld.getResource(CorrectedEntities).clear()
  correctedWorld.getResource(CorrectedEntities).clear()

  for (let i = 0; i < snapshotStage.length; i++) {
    let serverSnapshot = snapshotStage[i]
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

  for (let i = 0; i < commandBuffers.length; i++) {
    commandBuffers[i].drainTo(expect(latestSnapshotTimestamp))
  }

  let currCorrectedCommandStage = correctedWorld.getResource(CommandStage)
  let nextCorrectedCommandStage = cloneCommandStage(commandStage)

  freeCommandStage(currCorrectedCommandStage)

  correctedWorld.setResource(CommandStage, nextCorrectedCommandStage)
  correctedWorld.setResource(LastCompletedTimestamp, latestSnapshotTimestamp)

  world.setResource(PredictionBlendProgress, 0)
  world.setResource(PredictionStatus, "fast_forwarding")
}

let blendSystem = (world: j.World) => {
  world.setResource(PredictionBlendProgress, 1)
  world.setResource(PredictionStatus, "awaiting_snapshot")
}

export let clientPredictionPlugin = (app: j.App) => {
  let predictedWorld = expect(app.getResource(ServerWorld))
  let predictedWorldCommandStage = allocCommandStage()
  let correctedWorld = new j.World()
  let correctedWorldCommandStage = allocCommandStage()
  let commandStage = allocCommandStage()
  predictedWorld.setResource(
    j.Commands,
    makePredictionCommandsProxy(predictedWorld),
  )
  correctedWorld.setResource(
    j.Commands,
    makePredictionCommandsProxy(correctedWorld),
  )
  predictedWorld.setResource(CommandStage, predictedWorldCommandStage)
  correctedWorld.setResource(CommandStage, correctedWorldCommandStage)
  predictedWorld.setResource(CorrectedEntities, new Set())
  correctedWorld.setResource(CorrectedEntities, new Set())
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
      j.after(j.Group.LateUpdate).before(j.Group.Late),
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
    .addSystemToGroup(
      j.FixedGroup.Update,
      stepPredictionWorldsSystem,
      j.after(forwardCommandsSystem),
      world =>
        world.getResource(PredictionStatus) !== "initial" &&
        world.getResource(PredictionStatus) !== "synced",
    )
    .addSystemToGroup(
      j.Group.LateUpdate,
      blendSystem,
      null,
      world => world.getResource(PredictionStatus) === "blending",
    )
}
