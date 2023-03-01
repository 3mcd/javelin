import * as j from "@javelin/ecs"
import {
  advanceFixedTimestepSystem,
  FixedTimestep,
  _queryMask,
} from "@javelin/ecs"
import {exists, expect, Maybe, SparseSet} from "@javelin/lib"
import {ServerWorld} from "./client_resources.js"
import {BLEND_LATENCY, MAX_STEPS_PER_FRAME} from "./const.js"
import {NormalizedNetworkModel} from "./model.js"
import {
  allocDisplay,
  blendDisplays,
  createDisplay,
  Display,
  freeDisplay,
} from "./prediction_display.js"
import {
  CorrectedWorld,
  NormalizedPredictionConfig,
  PredictedWorld,
  PredictionConfig,
  PredictionScopes,
} from "./prediction_resources.js"
import {applySnapshots, updateDisplay} from "./prediction_scope.js"
import {
  allocCommandStage,
  cloneCommandStage,
  CommandStage,
  ensureCommandBuffer,
  freeCommandStage,
  LastCompletedStep,
} from "./resources.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

type PredictionStatus =
  | "initial"
  | "synced"
  | "awaiting_snapshot"
  | "blending"
  | "fast_forwarding"

class PredictionDisplayApi {
  #display: Maybe<Display>

  setDisplay(display: Display) {
    if (exists(this.#display)) {
      freeDisplay(this.#display)
    }
    this.#display = display
  }

  get<T extends j.Singleton>(
    entity: j.Entity,
    component: T,
  ): Maybe<j.Value<T>> {
    return this.#display?.[component.components[0]]?.get(entity) as Maybe<
      j.Value<T>
    >
  }
}

export let CorrectedEntities = j.resource<Set<j.Entity>>()
export let NewPredictionDisplay = j.resource<Display>()
export let OldPredictionDisplay = j.resource<Display>()
export let PredictionBlendProgress = j.resource<number>()
export let PredictionDisplay = j.resource<PredictionDisplayApi>()
export let PredictionStatus = j.resource<PredictionStatus>()

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
      let commandBuffer = commandStage.get(commandType.hash) as Maybe<
        TimestampBuffer<j.ComponentValue<T>>
      >
      let prevStep = world.getResource(LastCompletedStep)
      let currStep = prevStep + 1
      commandBuffer?.forEachUpTo(currStep, iteratee)
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
  let prevStep = world.getResource(LastCompletedStep)
  let currStep = prevStep + 1
  for (let i = 0; i < systemGroup.systems.length; i++) {
    let system = systemGroup.systems[i]
    system.run(world)
  }
  let commandStage = world.getResource(CommandStage)
  let commandBuffers = commandStage.values()
  for (let i = 0; i < commandBuffers.length; i++) {
    commandBuffers[i].drainTo(currStep)
  }
  world.setResource(LastCompletedStep, currStep)
}

export let stepPredictionWorldsSystem = (world: j.World) => {
  let correctedWorld = world.getResource(CorrectedWorld)
  let predictedWorld = world.getResource(PredictedWorld)
  let predictedSystemGroup = expect(
    world.getResource(j.SystemGroups).get(PredictionGroup.Update),
  )
  if (
    predictedWorld.getResource(LastCompletedStep) <
    correctedWorld.getResource(LastCompletedStep)
  ) {
    console.warn("Predicted world is behind corrected world")
  }

  stepPredictionWorld(predictedWorld, predictedSystemGroup)

  let completedSteps = 0
  let prevQueryMask = _queryMask.current
  _queryMask.current = world.getResource(CorrectedEntities)

  // Fast-forward the corrected entities by a maximum of MAX_STEPS_PER_FRAME.
  while (
    correctedWorld.getResource(LastCompletedStep) <
      predictedWorld.getResource(LastCompletedStep) &&
    completedSteps++ < MAX_STEPS_PER_FRAME
  ) {
    stepPredictionWorld(correctedWorld, predictedSystemGroup)
  }

  _queryMask.current = prevQueryMask

  if (
    world.getResource(PredictionStatus) === "fast_forwarding" &&
    correctedWorld.getResource(LastCompletedStep) ===
      predictedWorld.getResource(LastCompletedStep)
  ) {
    world.setResource(PredictionBlendProgress, 0)
    world.setResource(PredictionStatus, "blending")
  }
}

export let forwardCommandsSystem = (world: j.World) => {
  let networkModel = world.getResource(NormalizedNetworkModel)
  let commands = world.getResource(j.Commands)
  let commandStage = world.getResource(CommandStage)
  let commandTimestamp = world.getResource(j.FixedStep)
  let predictedCommandStage = world
    .getResource(PredictedWorld)
    .getResource(CommandStage)
  let correctedCommandStage = world
    .getResource(CorrectedWorld)
    .getResource(CommandStage)

  for (let i = 0; i < networkModel.commandTypes.length; i++) {
    let commandType = networkModel.commandTypes[i]
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
  predictedWorld.setResource(LastCompletedStep, timestamp)
  correctedWorld.setResource(LastCompletedStep, timestamp)
  world.setResource(PredictionStatus, "awaiting_snapshot")
}

let timeskipWorldsSystem = (world: j.World) => {
  let correctedWorld = world.getResource(CorrectedWorld)
  let predictedWorld = world.getResource(PredictedWorld)
  let timestamp = world.getResource(j.FixedStep)
  if (
    correctedWorld.getResource(LastCompletedStep) ===
    predictedWorld.getResource(LastCompletedStep)
  ) {
    correctedWorld.setResource(LastCompletedStep, timestamp)
  }
  predictedWorld.setResource(LastCompletedStep, timestamp)
}

let applySnapshotsSystem = (world: j.World) => {
  let correctedEntities = world.getResource(CorrectedEntities)
  let predictionScopes = world.getResource(PredictionScopes).values()
  let predictionScopesHaveSnapshot = false

  for (let i = 0; i < predictionScopes.length; i++) {
    if (predictionScopes[i].snapshots.length > 0) {
      predictionScopesHaveSnapshot = true
      break
    }
  }

  if (!predictionScopesHaveSnapshot) {
    return
  }

  correctedEntities.clear()

  swapPredictionWorlds(world)

  let commandStage = world.getResource(CommandStage)
  let commandBuffers = commandStage.values()
  let correctedWorld = world.getResource(CorrectedWorld)
  let lastSnapshotStep: Maybe<number>

  for (let i = 0; i < predictionScopes.length; i++) {
    let predictionScope = predictionScopes[i]
    let snapshotStep = applySnapshots(
      predictionScope,
      correctedWorld,
      correctedEntities,
    )
    if (!exists(lastSnapshotStep) || snapshotStep > lastSnapshotStep) {
      lastSnapshotStep = snapshotStep
    }
  }

  for (let i = 0; i < commandBuffers.length; i++) {
    commandBuffers[i].drainTo(expect(lastSnapshotStep))
  }

  let currCorrectedCommandStage = correctedWorld.getResource(CommandStage)
  let nextCorrectedCommandStage = cloneCommandStage(commandStage)

  freeCommandStage(currCorrectedCommandStage)

  correctedWorld.setResource(CommandStage, nextCorrectedCommandStage)
  correctedWorld.setResource(LastCompletedStep, lastSnapshotStep)

  world.setResource(PredictionBlendProgress, 0)
  world.setResource(PredictionStatus, "fast_forwarding")
}

let displaySystem = (world: j.World) => {
  let predictedWorld = world.getResource(PredictedWorld)
  let correctedWorld = world.getResource(CorrectedWorld)
  let predictionConfig = world.getResource(NormalizedPredictionConfig)
  let predictionScopes = world.getResource(PredictionScopes).values()
  let blendedDisplayAlpha = world.getResource(PredictionBlendProgress)
  let blendedDisplay = allocDisplay()
  if (world.hasResource(OldPredictionDisplay)) {
    freeDisplay(world.getResource(OldPredictionDisplay))
  }
  world.setResource(
    OldPredictionDisplay,
    world.getResource(NewPredictionDisplay),
  )
  world.setResource(NewPredictionDisplay, blendedDisplay)
  switch (world.getResource(PredictionStatus)) {
    case "fast_forwarding": {
      for (let i = 0; i < predictionScopes.length; i++) {
        let predictionScope = predictionScopes[i]
        updateDisplay(predictionScope, predictedWorld, blendedDisplay)
      }
      break
    }
    case "awaiting_snapshot":
    case "blending": {
      for (let i = 0; i < predictionScopes.length; i++) {
        let {type} = predictionScopes[i]
        let oldDisplay = createDisplay(predictedWorld, type)
        let newDisplay = createDisplay(correctedWorld, type)
        blendDisplays(
          type,
          oldDisplay,
          newDisplay,
          blendedDisplay,
          blendedDisplayAlpha,
          predictionConfig,
        )
        freeDisplay(oldDisplay)
        freeDisplay(newDisplay)
      }
      break
    }
  }
}

let blendSystem = (world: j.World) => {
  let fixedTimestep = world.getResource(j.FixedTimestep)
  let currBlendProgress = world.getResource(PredictionBlendProgress)
  let nextBlendProgress = Math.min(
    currBlendProgress + fixedTimestep.timeStep / BLEND_LATENCY,
    1,
  )
  world.setResource(PredictionBlendProgress, nextBlendProgress)
  if (nextBlendProgress === 1) {
    world.setResource(PredictionStatus, "awaiting_snapshot")
  }
}

let tweenSystem = (world: j.World) => {
  let predictionConfig = world.getResource(NormalizedPredictionConfig)
  let fixedTimestp = world.getResource(FixedTimestep)
  let oldDisplay = world.getResource(OldPredictionDisplay)
  let newDisplay = world.getResource(NewPredictionDisplay)
  let blendedDisplay = allocDisplay()
  let blendedDisplayTweenAlpha =
    1 - fixedTimestp.lastOvershootTime / fixedTimestp.timeStep
  if (exists(oldDisplay) && exists(newDisplay)) {
    world.getResource(PredictionScopes).each(scope => {
      blendDisplays(
        scope.type,
        oldDisplay,
        newDisplay,
        blendedDisplay,
        blendedDisplayTweenAlpha,
        predictionConfig,
      )
    })
  } else if (exists(oldDisplay)) {
    blendedDisplay = oldDisplay
  }
  world.getResource(PredictionDisplay).setDisplay(blendedDisplay)
}

let initPredictionWorld = (world: j.World) => {
  let commandStage = allocCommandStage()
  let commandProxy = makePredictionCommandsProxy(world)
  world.setResource(CommandStage, commandStage)
  world.setResource(j.Commands, commandProxy)
  world.setResource(LastCompletedStep, 0)
}

let normalizePredictionConfig = (
  predictionConfig: Partial<PredictionConfig>,
) => {
  let normalizedPredictionConfig: NormalizedPredictionConfig = {
    components: [],
  }
  if (exists(predictionConfig.components)) {
    for (let i = 0; i < predictionConfig.components.length; i++) {
      let [componentType, componentConfig] = predictionConfig.components[i]
      let component = componentType.components[0]
      normalizedPredictionConfig.components[component] = componentConfig
    }
  }
  return normalizedPredictionConfig
}

export let clientPredictionPlugin = (app: j.App) => {
  let predictionConfig = app.getResource(PredictionConfig) ?? {}
  let predictedWorld = expect(app.getResource(ServerWorld))
  let correctedWorld = new j.World()
  let commandStage = allocCommandStage()
  initPredictionWorld(predictedWorld)
  initPredictionWorld(correctedWorld)
  app
    .addResource(
      NormalizedPredictionConfig,
      normalizePredictionConfig(predictionConfig),
    )
    .addResource(PredictionDisplay, new PredictionDisplayApi())
    .addResource(PredictionScopes, new SparseSet())
    .addResource(PredictionStatus, "initial")
    .addResource(PredictionBlendProgress, 0)
    .addResource(CommandStage, commandStage)
    .addResource(PredictedWorld, predictedWorld)
    .addResource(CorrectedWorld, correctedWorld)
    .addResource(CorrectedEntities, new Set())
    .addResource(OldPredictionDisplay, [])
    .addResource(NewPredictionDisplay, [])
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
      j.Group.Early,
      timeskipWorldsSystem,
      j.after(advanceFixedTimestepSystem),
      world =>
        world.getResource(j.FixedTimestep).lastAdvanceResultedInTimeskip(),
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
      j.FixedGroup.Update,
      blendSystem,
      j.after(stepPredictionWorldsSystem),
      world => world.getResource(PredictionStatus) === "blending",
    )
    .addSystemToGroup(j.FixedGroup.Update, displaySystem, j.after(blendSystem))
    .addSystemToGroup(j.Group.LateUpdate, tweenSystem)
}
