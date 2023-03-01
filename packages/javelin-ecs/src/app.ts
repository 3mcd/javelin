import {assert, expect, Maybe} from "@javelin/lib"
import {commandPlugin} from "./command.js"
import {fixedTimestepPlugin} from "./fixed_timestep.js"
import {makeResource, Resource} from "./resource.js"
import {
  Constraints,
  makeConstraintsFromAfter,
  makeConstraintsFromBefore,
  Predicate,
  Schedule,
  SystemGroup,
} from "./schedule.js"
import {SystemImpl} from "./system.js"
import {stepPlugin} from "./step.js"
import {timePlugin} from "./time.js"
import {
  CurrentSystem,
  CurrentSystemGroup,
  World,
  _commitStagedChanges,
  _emitStagedChanges,
} from "./world.js"

export type Constrain<T> = (constraints: Constraints<T>) => Constraints<T>
export type Plugin = (app: App) => void

/**
 * Built-in groups.
 */
export enum DefaultGroup {
  /**
   * Executed once, at the beginning of an app's first step.
   */
  Init = "init",
  /**
   * Executed at the beginning of each step.
   */
  Early = "early",
  /**
   * Executed immediately before the update phase.
   */
  EarlyUpdate = "early_update",
  /**
   * The main update phase. Systems are added to this group by default.
   */
  Update = "update",
  /**
   * Executed immediately after the update group.
   */
  LateUpdate = "late_update",
  /**
   * Executed at the end of each step.
   */
  Late = "late",
}

/**
 * @private
 */
export const _systemGroups = Symbol()

/**
 * @private
 */
export let SystemGroups = makeResource<Map<string, SystemGroup>>()

let defaultGroupsPlugin = (app: App) => {
  let initGroupEnabled = true
  let disableInitGroupSystem = () => {
    initGroupEnabled = false
  }
  app
    .addSystemGroup(
      DefaultGroup.Init,
      makeConstraintsFromBefore(DefaultGroup.Early),
      () => initGroupEnabled,
    )
    .addSystemGroup(
      DefaultGroup.Early,
      makeConstraintsFromAfter(DefaultGroup.Init).before(
        DefaultGroup.EarlyUpdate,
      ),
    )
    .addSystemGroup(
      DefaultGroup.EarlyUpdate,
      makeConstraintsFromAfter(DefaultGroup.Early).before(DefaultGroup.Update),
    )
    .addSystemGroup(
      DefaultGroup.Update,
      makeConstraintsFromAfter(DefaultGroup.EarlyUpdate).before(
        DefaultGroup.LateUpdate,
      ),
    )
    .addSystemGroup(
      DefaultGroup.LateUpdate,
      makeConstraintsFromAfter(DefaultGroup.Update).before(DefaultGroup.Late),
    )
    .addSystemGroup(
      DefaultGroup.Late,
      makeConstraintsFromAfter(DefaultGroup.LateUpdate),
    )
    .addSystemToGroup(DefaultGroup.Init, disableInitGroupSystem)
}

export class App {
  #systemGroupScheduleIsStale
  #systemGroupSchedule
  #systemGroupsById
  #systemGroupsByLabel
  #systemGroupRuns;

  [_systemGroups]: SystemGroup[]

  readonly world: World

  constructor(resources?: Map<Resource<unknown>, unknown>) {
    this.#systemGroupSchedule = new Schedule<string>()
    this.#systemGroupsByLabel = new Map<string, SystemGroup>()
    this.#systemGroupScheduleIsStale = true
    this.#systemGroupsById = [] as SystemGroup[]
    this.#systemGroupRuns = [] as number[]
    this[_systemGroups] = []
    this.world = new World()
    for (let [resource, value] of resources ?? []) {
      this.addResource(resource, value)
    }
    this.use(defaultGroupsPlugin)
      .use(commandPlugin)
      .use(stepPlugin)
      .use(timePlugin)
      .use(fixedTimestepPlugin)
      .addResource(SystemGroups, this.#systemGroupsByLabel)
  }

  #updateSystemGroupSchedule() {
    if (this.#systemGroupScheduleIsStale) {
      let systemGroups = this.#systemGroupSchedule.build()
      this[_systemGroups] = systemGroups.map(groupId =>
        expect(this.#systemGroupsByLabel.get(groupId)),
      )
      this.#systemGroupScheduleIsStale = false
    }
  }

  use(plugin: Plugin): App {
    plugin(this)
    return this
  }

  addResource<T>(resource: Resource<T>, value: T): App {
    assert(!this.world.hasResource(resource))
    this.world.setResource(resource, value)
    return this
  }

  hasResource(resource: Resource<unknown>): boolean {
    return this.world.hasResource(resource)
  }

  getResource<T>(resource: Resource<T>): Maybe<T> {
    return this.world.hasResource(resource)
      ? this.world.getResource(resource)
      : undefined
  }

  addSystemGroup(
    systemGroupLabel: string,
    constraints?: Maybe<Constraints<string>>,
    predicate?: Maybe<Predicate>,
    systemConstraints?: Maybe<Constraints<SystemImpl>>,
  ) {
    expect(!this.#systemGroupsByLabel.has(systemGroupLabel))
    let systemGroup = new SystemGroup(predicate, systemConstraints)
    this.#systemGroupsById[systemGroup.id] = systemGroup
    this.#systemGroupsByLabel.set(systemGroupLabel, systemGroup)
    Constraints.insert(
      this.#systemGroupSchedule,
      systemGroupLabel,
      constraints ?? new Constraints(),
    )
    this.#systemGroupScheduleIsStale = true
    return this
  }

  addSystem(
    system: SystemImpl,
    constraints?: Maybe<Constraints<SystemImpl>>,
    predicate?: Maybe<Predicate>,
  ): App {
    this.addSystemToGroup(DefaultGroup.Update, system, constraints, predicate)
    return this
  }

  addSystemToGroup(
    groupId: string,
    system: SystemImpl,
    constraints?: Maybe<Constraints<SystemImpl>>,
    predicate?: Maybe<Predicate>,
  ): App {
    let systemGroup = expect(this.#systemGroupsByLabel.get(groupId))
    systemGroup.addSystem(system, constraints, predicate)
    return this
  }

  addInitSystem(
    system: SystemImpl,
    constraints?: Maybe<Constraints<SystemImpl>>,
    predicate?: Maybe<Predicate>,
  ) {
    this.addSystemToGroup(DefaultGroup.Init, system, constraints, predicate)
    return this
  }

  removeSystem(system: SystemImpl, groupId = DefaultGroup.Update) {
    let systemGroup = expect(this.#systemGroupsByLabel.get(groupId))
    systemGroup.removeSystem(system)
  }

  #runSystemGroup(systemGroup: SystemGroup) {
    // The `CurrentSystemGroup` resource is used by the world to dispatch commands.
    this.world.setResource(CurrentSystemGroup, systemGroup)
    for (let j = 0; j < systemGroup.systems.length; j++) {
      let system = systemGroup.systems[j]
      if (system.isEnabled(this.world)) {
        // The `CurrentSystem` resource is used by the world to attach new
        // queries and monitors to their originating systems.
        this.world.setResource(CurrentSystem, system)
        system.run(this.world)
        let monitors = system.monitors.values()
        for (let k = 0; k < monitors.length; k++) {
          let monitor = monitors[k]
          monitor.clear()
        }
        let immediateMonitors = system.immediateMonitors.values()
        for (let k = 0; k < immediateMonitors.length; k++) {
          let immediateMonitor = immediateMonitors[k]
          immediateMonitor.clear()
        }
        // Notify immediate monitors of intra-step entity modifications.
        this.world[_emitStagedChanges]()
      }
    }
    systemGroup.drainCommands()
  }

  step() {
    this.#updateSystemGroupSchedule()
    let systemGroupCursor = 0
    let systemGroupLength = this[_systemGroups].length
    let systemGroupRunsRemaining = 0
    // Notify monitors of any changes that happened outside of the main loop.
    this.world[_emitStagedChanges]()
    // Try to run each system group once. This allows earlier systems to
    // initialize resources required by later system groups to calculate their
    // number of runs.
    for (let i = 0; i < systemGroupLength; i++) {
      let systemGroup = this[_systemGroups][i]
      let systemGroupRuns = systemGroup.runs(this.world)
      if (systemGroupRuns > 0) {
        this.#runSystemGroup(systemGroup)
        systemGroupRuns--
      }
      // Store remaining runs and accumulate total run counter.
      this.#systemGroupRuns[i] = systemGroupRuns
      systemGroupRunsRemaining += systemGroupRuns
    }
    // Commit changes from the initial run.
    this.world[_commitStagedChanges]()
    // Carry out remaining runs.
    while (systemGroupRunsRemaining > 0) {
      let systemGroupIndex = systemGroupCursor % systemGroupLength
      let systemGroup = this[_systemGroups][systemGroupIndex]
      if (this.#systemGroupRuns[systemGroupIndex] > 0) {
        this.#runSystemGroup(systemGroup)
        this.#systemGroupRuns[systemGroupIndex]--
        systemGroupRunsRemaining--
      }
      if (systemGroupIndex === this.#systemGroupRuns.length - 1) {
        this.world[_commitStagedChanges]()
      }
      systemGroupCursor++
    }
    return this
  }
}

export let makeApp = (resources?: Map<Resource<unknown>, unknown>) =>
  new App(resources)
