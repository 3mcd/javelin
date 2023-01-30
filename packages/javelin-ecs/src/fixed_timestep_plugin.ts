import {Time, advanceTimeSystem} from "./time_plugin.js"
import {App, DefaultGroup} from "./app.js"
import {
  FixedTimestepConfig as FixedTimestepImplConfig,
  FixedTimestepImpl,
  TerminationCondition,
} from "./fixed_timestep.js"
import {makeResource} from "./resource.js"
import {World} from "./world.js"
import {makeConstraintsWithAfter} from "./schedule.js"

export let defaultFixedTimestepConfig: FixedTimestepImplConfig = {
  timeStep: 1 / 60,
  timeSkipThreshold: 1,
  terminationCondition: TerminationCondition.FirstOvershoot,
  maxUpdateDelta: 0.1,
}

export enum FixedGroup {
  Early = "FixedEarly",
  EarlyUpdate = "FixedEarlyUpdate",
  Update = "FixedUpdate",
  LateUpdate = "FixedLateUpdate",
}

export type FixedTimestepConfig = Partial<FixedTimestepImplConfig>
export let FixedTimestepConfig = makeResource<Partial<FixedTimestepConfig>>()
export let FixedTimestepTargetTime = makeResource<number>()
export let FixedTimestep = makeResource<FixedTimestepImpl>()
export let FixedTick = makeResource<number>()
export let FixedTime = makeResource<Time>()

export let advanceFixedTimestepSystem = (world: World) => {
  let {currentTime, deltaTime} = world.getResource(Time)
  let fixedTimestep = world.getResource(FixedTimestep)
  fixedTimestep.update(
    deltaTime,
    world.tryGetResource(FixedTimestepTargetTime) ?? currentTime,
  )
}

export let advanceFixedTickSystem = (world: World) => {
  let fixedTimestep = world.getResource(FixedTimestep)
  world.setResource(
    FixedTick,
    world.getResource(FixedTick) + fixedTimestep.steps,
  )
}

export let advanceFixedTimeSystem = (world: World) => {
  let fixedTime = world.getResource(FixedTime)
  let fixedTimestep = world.getResource(FixedTimestep)
  fixedTime.previousTime = fixedTime.currentTime
  fixedTime.currentTime = fixedTimestep.currentTime
}

export let fixedTimestepPlugin = (app: App) => {
  let fixedTimestepConfig = {
    ...defaultFixedTimestepConfig,
    ...app.getResource(FixedTimestepConfig),
  }
  let fixedTimestep = new FixedTimestepImpl(fixedTimestepConfig)
  let getFixedRuns = (world: World) => world.getResource(FixedTimestep).steps
  app
    .addResource(FixedTimestep, fixedTimestep)
    .addResource(FixedTick, 0)
    .addResource(FixedTime, {
      currentTime: 0,
      previousTime: 0,
      deltaTime: fixedTimestepConfig.timeStep,
    })
    .addSystemGroup(
      FixedGroup.Early,
      makeConstraintsWithAfter(DefaultGroup.Early).before(
        DefaultGroup.EarlyUpdate,
      ),
      getFixedRuns,
    )
    .addSystemGroup(
      FixedGroup.EarlyUpdate,
      makeConstraintsWithAfter(DefaultGroup.EarlyUpdate).before(
        DefaultGroup.Update,
      ),
      getFixedRuns,
    )
    .addSystemGroup(
      FixedGroup.Update,
      makeConstraintsWithAfter<FixedGroup | DefaultGroup>(
        FixedGroup.Update,
      ).before(DefaultGroup.LateUpdate),
      getFixedRuns,
    )
    .addSystemGroup(
      FixedGroup.LateUpdate,
      makeConstraintsWithAfter<FixedGroup | DefaultGroup>(
        FixedGroup.LateUpdate,
      ).before(DefaultGroup.Late),
      getFixedRuns,
    )
    .addSystemToGroup(
      DefaultGroup.Early,
      advanceFixedTimestepSystem,
      makeConstraintsWithAfter(advanceTimeSystem),
    )
    .addSystemToGroup(FixedGroup.Early, advanceFixedTimeSystem)
    .addSystemToGroup(FixedGroup.Early, advanceFixedTickSystem)
}
