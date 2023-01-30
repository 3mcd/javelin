import {assert, expect, Maybe} from "@javelin/lib"
import {fixedTimestepPlugin} from "./fixed_timestep_plugin.js"
import {Resource} from "./resource.js"
import {
  Constraints,
  makeConstraintsWithAfter,
  makeConstraintsWithBefore,
  Predicate,
  Schedule,
  SystemGroup,
} from "./schedule.js"
import {SystemImpl} from "./system.js"
import {tickPlugin} from "./tick_plugin.js"
import {timePlugin} from "./time_plugin.js"
import {
  CurrentSystem,
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
  Init = "Init",
  /**
   * Executed at the beginning of each step.
   */
  Early = "Early",
  /**
   * Executed immediately before the update phase.
   */
  EarlyUpdate = "EarlyUpdate",
  /**
   * The main update phase. Systems are added to this group by default.
   */
  Update = "Update",
  /**
   * Executed immediately after the update group.
   */
  LateUpdate = "LateUpdate",
  /**
   * Executed at the end of each step.
   */
  Late = "Late",
}

let defaultGroupsPlugin = (app: App) => {
  let initGroupEnabled = true
  let disableInitGroupSystem = () => {
    initGroupEnabled = false
  }
  app
    .addSystemGroup(
      DefaultGroup.Init,
      makeConstraintsWithBefore(DefaultGroup.Early),
      () => initGroupEnabled,
    )
    .addSystemGroup(
      DefaultGroup.Early,
      makeConstraintsWithAfter(DefaultGroup.Init).before(
        DefaultGroup.EarlyUpdate,
      ),
    )
    .addSystemGroup(
      DefaultGroup.EarlyUpdate,
      makeConstraintsWithAfter(DefaultGroup.Early).before(DefaultGroup.Update),
    )
    .addSystemGroup(
      DefaultGroup.Update,
      makeConstraintsWithAfter(DefaultGroup.EarlyUpdate).before(
        DefaultGroup.LateUpdate,
      ),
    )
    .addSystemGroup(
      DefaultGroup.LateUpdate,
      makeConstraintsWithAfter(DefaultGroup.Update).before(DefaultGroup.Late),
    )
    .addSystemGroup(
      DefaultGroup.Late,
      makeConstraintsWithAfter(DefaultGroup.LateUpdate),
    )
    .addSystemToGroup(DefaultGroup.Init, disableInitGroupSystem)
}

export class App {
  #systemGroupScheduleIsStale
  #systemGroupSchedule
  #systemGroups
  #systemGroupsById

  readonly world: World

  constructor(world: World) {
    this.#systemGroupSchedule = new Schedule<string>()
    this.#systemGroupsById = new Map<string, SystemGroup>()
    this.#systemGroups = [] as SystemGroup[]
    this.#systemGroupScheduleIsStale = true
    this.world = world
    this.use(defaultGroupsPlugin)
      .use(tickPlugin)
      .use(timePlugin)
      .use(fixedTimestepPlugin)
  }

  #updateSystemGroupSchedule() {
    if (this.#systemGroupScheduleIsStale) {
      let systemGroups = this.#systemGroupSchedule.build()
      this.#systemGroups = systemGroups.map(groupId =>
        expect(this.#systemGroupsById.get(groupId)),
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
    systemGroupId: string,
    constraints: Maybe<Constraints<string>>,
    predicate?: Maybe<Predicate>,
  ) {
    expect(!this.#systemGroupsById.has(systemGroupId))
    let systemGroup = new SystemGroup(predicate)
    this.#systemGroupsById.set(systemGroupId, systemGroup)
    Constraints.insert(
      this.#systemGroupSchedule,
      systemGroupId,
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
    let systemGroup = expect(this.#systemGroupsById.get(groupId))
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
    let systemGroup = expect(this.#systemGroupsById.get(groupId))
    systemGroup.removeSystem(system)
  }

  step() {
    let {world} = this
    this.#updateSystemGroupSchedule()
    for (let i = 0; i < this.#systemGroups.length; i++) {
      let systemGroup = this.#systemGroups[i]
      let systemGroupRuns = systemGroup.runs(world)
      while (systemGroupRuns-- > 0) {
        for (let j = 0; j < systemGroup.systems.length; j++) {
          let system = systemGroup.systems[j]
          if (system.isEnabled(world)) {
            // The `CurrentSystem` resource is used by the world to attach new
            // queries and monitors to their originating systems.
            this.world.setResource(CurrentSystem, system)
            system.systemImpl(world)
            // Clear each of the system's monitors after the system is
            // complete.
            let monitors = system.monitors.values()
            for (let k = 0; k < monitors.length; k++) {
              let monitor = monitors[k]
              monitor.clear()
            }
            // Notify immediate monitors of intra-step entity modifications.
            this.world[_emitStagedChanges]()
          }
        }
      }
    }
    // Notify monitors of inter-step entity modifications.
    this.world[_commitStagedChanges]()
    return this
  }
}

export let makeApp = (world = new World()) => new App(world)
