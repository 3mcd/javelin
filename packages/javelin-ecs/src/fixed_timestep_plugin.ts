import {App, DefaultGroup} from "./app.js"
import {
  FixedTimestepConfig as FixedTimestepImplConfig,
  FixedTimestepImpl,
  TerminationCondition,
} from "./fixed_timestep.js"
import {makeResource} from "./resource.js"
import {makeConstraintsWithAfter} from "./schedule.js"
import {advanceTimeSystem, Time} from "./time_plugin.js"
import {World} from "./world.js"

export {TerminationCondition}

export let defaultFixedTimestepConfig: FixedTimestepImplConfig = {
  timeStep: 1 / 60,
  maxDrift: 1,
  terminationCondition: TerminationCondition.FirstOvershoot,
  maxUpdateDelta: 0.1,
}

export enum FixedGroup {
  Early = "fixed_early",
  EarlyUpdate = "fixed_early_update",
  Update = "fixed_update",
  LateUpdate = "fixed_late_update",
  Late = "fixed_late",
}

export type FixedTimestepConfig = Partial<FixedTimestepImplConfig>
export let FixedTimestepConfig = makeResource<Partial<FixedTimestepConfig>>()
export let FixedTimestepTargetTime = makeResource<number>()
export let FixedTimestepControlled = makeResource<boolean>()
export let FixedTimestep = makeResource<FixedTimestepImpl>()
export let FixedStep = makeResource<number>()
export let FixedTime = makeResource<Time>()
export let FixedStepTarget = makeResource<number>()

/**
 * Mark the fixed timestep as controlled when the `FixedTimestepTargetTime` resource is
 * first set. Also resets the fixed timestep's current time to the provided target time.
 */
export let controlFixedTimestepSystem = (world: World) => {
  let fixedTimestep = world.getResource(FixedTimestep)
  let fixedTimestepTargetTime = world.getResource(FixedTimestepTargetTime)
  fixedTimestep.reset(fixedTimestepTargetTime)
  world.setResource(FixedTimestepControlled, true)
}

/**
 * Advances the fixed timestep each app step.
 */
export let advanceFixedTimestepSystem = (world: World) => {
  let {currentTime, deltaTime} = world.getResource(Time)
  let fixedTimestep = world.getResource(FixedTimestep)
  let targetTime = world.tryGetResource(FixedTimestepTargetTime) ?? currentTime
  fixedTimestep.advance(deltaTime, targetTime)
}

/**
 * Initialize the fixed steps once at the beginning of each fixed group.
 */
export let initFixedTickSystem = (world: World) => {
  let fixedTimestep = world.getResource(FixedTimestep)
  let fixedSteps = fixedTimestep.steps
  let targetStep = fixedTimestep.currentStep
  world.setResource(FixedStep, targetStep - fixedSteps)
  world.setResource(FixedStepTarget, targetStep)
}

/**
 * Increment the fixed steps at the end of each fixed group.
 */
export let incrementFixedGroupTickSystem = (world: World) => {
  let fixedStep = world.getResource(FixedStep)
  world.setResource(FixedStep, fixedStep + 1)
}

/**
 * Synchronize the `FixedTime` resource with the fixed group's tick.
 */
export let advanceFixedGroupTimeSystem = (world: World) => {
  let fixedTimestep = world.getResource(FixedTimestep)
  let fixedTime = world.getResource(FixedTime)
  let fixedStep = world.getResource(FixedStep)
  let currentTime = fixedStep * fixedTimestep.timeStep
  fixedTime.previousTime = currentTime - fixedTimestep.timeStep
  fixedTime.currentTime = currentTime
  fixedTime.deltaTime = fixedTimestep.timeStep
}

let fixedTimestepSteps = (world: World) =>
  world.getResource(FixedTimestep).steps

let lastFixedGroupCompleted = (world: World) =>
  !world.hasResource(FixedStepTarget) ||
  world.getResource(FixedStep) === world.getResource(FixedStepTarget)

let initFixedGroup = (app: App, fixedGroup: FixedGroup) => {
  app
    .addSystemToGroup(
      fixedGroup,
      initFixedTickSystem,
      null,
      lastFixedGroupCompleted,
    )
    .addSystemToGroup(
      fixedGroup,
      advanceFixedGroupTimeSystem,
      makeConstraintsWithAfter(initFixedTickSystem).before(
        incrementFixedGroupTickSystem,
      ),
    )
    .addSystemToGroup(
      fixedGroup,
      incrementFixedGroupTickSystem,
      makeConstraintsWithAfter(initFixedTickSystem),
    )
}

export let fixedTimestepPlugin = (app: App) => {
  let fixedTimestepConfig = {
    ...defaultFixedTimestepConfig,
    ...app.getResource(FixedTimestepConfig),
  }
  let fixedTimestep = new FixedTimestepImpl(fixedTimestepConfig)
  app
    .addResource(FixedTimestep, fixedTimestep)
    .addResource(FixedTimestepControlled, false)
    .addResource(FixedStep, -1)
    .addResource(FixedTime, {
      currentTime: 0,
      previousTime: 0,
      deltaTime: 0,
    })
    .addSystemGroup(
      FixedGroup.Early,
      makeConstraintsWithAfter(DefaultGroup.Early).before(
        DefaultGroup.EarlyUpdate,
      ),
      fixedTimestepSteps,
    )
    .addSystemGroup(
      FixedGroup.EarlyUpdate,
      makeConstraintsWithAfter(DefaultGroup.EarlyUpdate).before(
        DefaultGroup.Update,
      ),
      fixedTimestepSteps,
    )
    .addSystemGroup(
      FixedGroup.Update,
      makeConstraintsWithAfter<FixedGroup | DefaultGroup>(
        FixedGroup.Update,
      ).before(DefaultGroup.LateUpdate),
      fixedTimestepSteps,
    )
    .addSystemGroup(
      FixedGroup.LateUpdate,
      makeConstraintsWithAfter<FixedGroup | DefaultGroup>(
        FixedGroup.LateUpdate,
      ).before(DefaultGroup.Late),
      fixedTimestepSteps,
    )
    .addSystemGroup(
      FixedGroup.Late,
      makeConstraintsWithAfter<FixedGroup | DefaultGroup>(
        FixedGroup.LateUpdate,
      ).after(DefaultGroup.Late),
      fixedTimestepSteps,
    )
    .addSystemToGroup(
      DefaultGroup.Early,
      controlFixedTimestepSystem,
      null,
      world =>
        world.getResource(FixedTimestepControlled) === false &&
        world.hasResource(FixedTimestepTargetTime),
    )
    .addSystemToGroup(
      DefaultGroup.Early,
      advanceFixedTimestepSystem,
      makeConstraintsWithAfter(advanceTimeSystem).after(
        controlFixedTimestepSystem,
      ),
    )
  initFixedGroup(app, FixedGroup.Early)
  initFixedGroup(app, FixedGroup.EarlyUpdate)
  initFixedGroup(app, FixedGroup.Update)
  initFixedGroup(app, FixedGroup.LateUpdate)
  initFixedGroup(app, FixedGroup.Late)
}
