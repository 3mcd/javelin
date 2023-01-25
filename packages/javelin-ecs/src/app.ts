import {assert, expect, Maybe} from "@javelin/lib"
import {Resource} from "./resource.js"
import {
  Constraints,
  SystemGroup,
  Predicate,
  Schedule,
} from "./schedule.js"
import {SystemImpl} from "./system.js"
import {CurrentSystem, World} from "./world.js"

export type Constrain<T> = (
  constraints: Constraints<T>,
) => Constraints<T>
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

let defaultPlugin = (app: App) => {
  let hasRunInitGroup = true
  app
    .addSystemGroup(
      DefaultGroup.Init,
      _ => _.before(DefaultGroup.Early),
      () => hasRunInitGroup,
    )
    .addSystemGroup(DefaultGroup.Early, _ =>
      _.after(DefaultGroup.Init).before(DefaultGroup.EarlyUpdate),
    )
    .addSystemGroup(DefaultGroup.EarlyUpdate, _ =>
      _.after(DefaultGroup.Early).before(DefaultGroup.Update),
    )
    .addSystemGroup(DefaultGroup.Update, _ =>
      _.after(DefaultGroup.EarlyUpdate).before(
        DefaultGroup.LateUpdate,
      ),
    )
    .addSystemGroup(DefaultGroup.LateUpdate, _ =>
      _.after(DefaultGroup.Update).before(DefaultGroup.Late),
    )
    .addSystemGroup(DefaultGroup.Late, _ =>
      _.after(DefaultGroup.LateUpdate),
    )
    .addSystemToGroup(
      DefaultGroup.Init,
      function disableInitGroupSystem() {
        hasRunInitGroup = false
      },
    )
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
    this.use(defaultPlugin)
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

  getResource<T>(resource: Resource<T>): Maybe<T> {
    return this.world.getResource(resource)
  }

  addSystemGroup(
    systemGroupId: string,
    constrain?: Constrain<string>,
    predicate?: Maybe<Predicate>,
  ) {
    expect(!this.#systemGroupsById.has(systemGroupId))
    let systemGroup = new SystemGroup(predicate)
    let systemGroupConstraints = new Constraints<string>()
    this.#systemGroupsById.set(systemGroupId, systemGroup)
    constrain?.(systemGroupConstraints)
    Constraints.insert(
      this.#systemGroupSchedule,
      systemGroupId,
      systemGroupConstraints,
    )
    this.#systemGroupScheduleIsStale = true
    return this
  }

  addSystem(
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    predicate?: Maybe<Predicate>,
  ): App {
    this.addSystemToGroup(
      DefaultGroup.Update,
      system,
      constrain,
      predicate,
    )
    return this
  }

  addSystemToGroup(
    groupId: string,
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    predicate?: Maybe<Predicate>,
  ): App {
    let systemGroup = expect(this.#systemGroupsById.get(groupId))
    systemGroup.addSystem(
      system,
      constrain?.(new Constraints()),
      predicate,
    )
    return this
  }

  addInitSystem(
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    predicate?: Maybe<Predicate>,
  ) {
    this.addSystemToGroup(
      DefaultGroup.Init,
      system,
      constrain,
      predicate,
    )
    return this
  }

  step() {
    let {world} = this
    this.#updateSystemGroupSchedule()
    for (let i = 0; i < this.#systemGroups.length; i++) {
      let systemGroup = this.#systemGroups[i]
      if (systemGroup.isEnabled(world)) {
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
            this.world.emitStagedChanges()
          }
        }
      }
    }
    // Notify monitors of inter-step entity modifications.
    this.world.commitStagedChanges()
    return this
  }
}

export let makeApp = (world = new World()) => new App(world)
