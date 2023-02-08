import {assert, expect, Maybe} from "@javelin/lib"
import {commandPlugin} from "./command.js"
import {fixedTimestepPlugin} from "./fixed_timestep_plugin.js"
import {makeResource, Resource} from "./resource.js"
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
  #systemGroupsById;

  [_systemGroups]: SystemGroup[]

  readonly world: World

  constructor(resources?: Map<Resource<unknown>, unknown>) {
    this.#systemGroupSchedule = new Schedule<string>()
    this.#systemGroupsById = new Map<string, SystemGroup>()
    this.#systemGroupScheduleIsStale = true
    this[_systemGroups] = []
    this.world = new World()
    for (let [resource, value] of resources ?? []) {
      this.addResource(resource, value)
    }
    this.use(defaultGroupsPlugin)
      .use(commandPlugin)
      .use(tickPlugin)
      .use(timePlugin)
      .use(fixedTimestepPlugin)
      .addResource(SystemGroups, this.#systemGroupsById)
  }

  #updateSystemGroupSchedule() {
    if (this.#systemGroupScheduleIsStale) {
      let systemGroups = this.#systemGroupSchedule.build()
      this[_systemGroups] = systemGroups.map(groupId =>
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
    constraints?: Maybe<Constraints<string>>,
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
    for (let i = 0; i < this[_systemGroups].length; i++) {
      let systemGroup = this[_systemGroups][i]
      let systemGroupRuns = systemGroup.runs(world)
      if (systemGroupRuns > 0) {
        // The `CurrentSystemGroup` resource is used by the world to dispatch commands.
        this.world.setResource(CurrentSystemGroup, systemGroup)
      }
      while (systemGroupRuns-- > 0) {
        for (let j = 0; j < systemGroup.systems.length; j++) {
          let system = systemGroup.systems[j]
          if (system.isEnabled(world)) {
            // The `CurrentSystem` resource is used by the world to attach new
            // queries and monitors to their originating systems.
            this.world.setResource(CurrentSystem, system)
            system.run(world)
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
        systemGroup.drainCommands()
      }
    }
    // Notify monitors of inter-step entity modifications.
    this.world[_commitStagedChanges]()
    return this
  }
}

export let makeApp = (resources?: Map<Resource<unknown>, unknown>) =>
  new App(resources)
