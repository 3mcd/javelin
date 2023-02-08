import {App, DefaultGroup} from "./app.js"
import {
  FixedTimestepper,
  FixedTimestepperConfig,
  TerminationCondition,
} from "./fixed_timestepper.js"
import {makeResource} from "./resource.js"
import {makeConstraintsFromAfter} from "./schedule.js"
import {advanceTimeSystem, Time} from "./time.js"
import {World} from "./world.js"

export {TerminationCondition}

export enum FixedGroup {
  Init = "fixed_init",
  Early = "fixed_early",
  EarlyUpdate = "fixed_early_update",
  Update = "fixed_update",
  LateUpdate = "fixed_late_update",
  Late = "fixed_late",
}

export type FixedTimestepConfig = Partial<FixedTimestepperConfig>
export let FixedTimestepConfig = makeResource<Partial<FixedTimestepConfig>>()
export let FixedTimestep = makeResource<FixedTimestepper>()
export let FixedTimestepTargetTime = makeResource<number>()
export let FixedTimestepControlled = makeResource<boolean>()
export let FixedTime = makeResource<Time>()
export let FixedStep = makeResource<number>()

let defaultFixedTimestepConfig: FixedTimestepperConfig = {
  timeStep: 1 / 60,
  maxDrift: 1,
  terminationCondition: TerminationCondition.FirstOvershoot,
  maxUpdateDelta: 0.1,
}

export let controlFixedTimestepSystem = (world: World) => {
  let fixedTimestep = world.getResource(FixedTimestep)
  let fixedTimestepTargetTime = world.getResource(FixedTimestepTargetTime)
  fixedTimestep.reset(fixedTimestepTargetTime)
  world.setResource(FixedStep, fixedTimestep.currentStep)
  world.setResource(FixedTimestepControlled, true)
}

export let advanceFixedTimestepSystem = (world: World) => {
  let {currentTime, deltaTime} = world.getResource(Time)
  let fixedTimestep = world.getResource(FixedTimestep)
  let targetTime = world.tryGetResource(FixedTimestepTargetTime) ?? currentTime
  fixedTimestep.advance(deltaTime, targetTime)
}

export let advanceFixedStepSystem = (world: World) => {
  world.setResource(FixedStep, world.getResource(FixedStep) + 1)
}

export let advanceFixedTimeSystem = (world: World) => {
  let fixedTimestep = world.getResource(FixedTimestep)
  let fixedTime = world.getResource(FixedTime)
  let fixedStep = world.getResource(FixedStep)
  fixedTime.previousTime = fixedStep * (fixedTimestep.timeStep - 1)
  fixedTime.currentTime = fixedStep * fixedTimestep.timeStep
  fixedTime.deltaTime = fixedTimestep.timeStep
}

let fixedGroupRuns = (world: World) => world.getResource(FixedTimestep).steps

export let fixedTimestepPlugin = (app: App) => {
  let fixedTimestepConfig = {
    ...defaultFixedTimestepConfig,
    ...app.getResource(FixedTimestepConfig),
  }
  let fixedTimestep = new FixedTimestepper(fixedTimestepConfig)
  app
    .addResource(FixedStep, 0)
    .addResource(FixedTimestep, fixedTimestep)
    .addResource(FixedTime, {
      previousTime: 0,
      currentTime: 0,
      deltaTime: 0,
    })
    .addResource(FixedTimestepControlled, false)
    // Fixed timestep control
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
      makeConstraintsFromAfter(controlFixedTimestepSystem).after(
        advanceTimeSystem,
      ),
    )
    // Fixed step initialization
    .addSystemGroup(
      FixedGroup.Init,
      makeConstraintsFromAfter(DefaultGroup.Early).before(
        DefaultGroup.EarlyUpdate,
      ),
      fixedGroupRuns,
    )
    .addSystemToGroup(FixedGroup.Init, advanceFixedStepSystem)
    // Fixed system groups
    .addSystemToGroup(
      FixedGroup.Init,
      advanceFixedTimeSystem,
      makeConstraintsFromAfter(advanceFixedStepSystem),
    )
    // Fixed steps
    .addSystemGroup(
      FixedGroup.Early,
      makeConstraintsFromAfter(FixedGroup.Init),
      fixedGroupRuns,
    )
    .addSystemGroup(
      FixedGroup.EarlyUpdate,
      makeConstraintsFromAfter(FixedGroup.Init),
      fixedGroupRuns,
    )
    .addSystemGroup(
      FixedGroup.Update,
      makeConstraintsFromAfter(FixedGroup.EarlyUpdate),
      fixedGroupRuns,
    )
    .addSystemGroup(
      FixedGroup.LateUpdate,
      makeConstraintsFromAfter(FixedGroup.Update),
      fixedGroupRuns,
    )
    .addSystemGroup(
      FixedGroup.Late,
      makeConstraintsFromAfter(FixedGroup.LateUpdate),
      fixedGroupRuns,
    )
}
