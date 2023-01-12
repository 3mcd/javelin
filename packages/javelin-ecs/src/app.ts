import {assert, exists, expect, Maybe} from "@javelin/lib"
import {Resource} from "./resource.js"
import {Constraints, Group, Predicate, Schedule} from "./schedule.js"
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
    .addGroup(
      DefaultGroup.Init,
      _ => _.before(DefaultGroup.Early),
      () => hasRunInitGroup,
    )
    .addGroup(DefaultGroup.Early, _ =>
      _.after(DefaultGroup.Init).before(DefaultGroup.EarlyUpdate),
    )
    .addGroup(DefaultGroup.EarlyUpdate, _ =>
      _.after(DefaultGroup.Early).before(DefaultGroup.Update),
    )
    .addGroup(DefaultGroup.Update, _ =>
      _.after(DefaultGroup.EarlyUpdate).before(
        DefaultGroup.LateUpdate,
      ),
    )
    .addGroup(DefaultGroup.LateUpdate, _ =>
      _.after(DefaultGroup.Update).before(DefaultGroup.Late),
    )
    .addGroup(DefaultGroup.Late, _ =>
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
  #groupScheduleIsStale
  #groupSchedule
  #groups
  #groupsById

  readonly world: World

  constructor(world: World) {
    this.#groupSchedule = new Schedule<string>()
    this.#groupsById = new Map<string, Group>()
    this.#groups = [] as Group[]
    this.#groupScheduleIsStale = true
    this.world = world
    this.use(defaultPlugin)
  }

  use(plugin: Plugin): App {
    plugin(this)
    return this
  }

  addResource<T>(resource: Resource<T>, resourceValue: T): App {
    assert(!this.world.hasResource(resource))
    this.world.setResource(resource, resourceValue)
    return this
  }

  getResource<T>(resource: Resource<T>): Maybe<T> {
    return this.world.getResource(resource)
  }

  addGroup(
    groupId: string,
    groupConstrain?: Constrain<string>,
    groupPredicate?: Maybe<Predicate>,
  ) {
    expect(!this.#groupsById.has(groupId))
    let group = new Group(groupPredicate)
    let constraints = new Constraints<string>()
    this.#groupsById.set(groupId, group)
    groupConstrain?.(constraints)
    Constraints.insert(this.#groupSchedule, groupId, constraints)
    this.#groupScheduleIsStale = true
    return this
  }

  addSystem(
    system: SystemImpl,
    systemConstrain?: Maybe<Constrain<SystemImpl>>,
    systemPredicate?: Maybe<Predicate>,
  ): App {
    this.addSystemToGroup(
      DefaultGroup.Update,
      system,
      systemConstrain,
      systemPredicate,
    )
    return this
  }

  addSystemToGroup(
    groupId: string,
    system: SystemImpl,
    systemConstrain?: Maybe<Constrain<SystemImpl>>,
    systemPredicate?: Maybe<Predicate>,
  ): App {
    let group = expect(this.#groupsById.get(groupId))
    group.addSystem(
      system,
      systemConstrain?.(new Constraints()),
      systemPredicate,
    )
    return this
  }

  addInitSystem(
    system: SystemImpl,
    systemConstrain?: Maybe<Constrain<SystemImpl>>,
    systemPredicate?: Maybe<Predicate>,
  ) {
    this.addSystemToGroup(
      DefaultGroup.Init,
      system,
      systemConstrain,
      systemPredicate,
    )
    return this
  }

  step(): void {
    if (this.#groupScheduleIsStale) {
      let groups = this.#groupSchedule.build()
      this.#groups = groups.map(groupId =>
        expect(this.#groupsById.get(groupId)),
      )
      this.#groupScheduleIsStale = false
    }
    for (let i = 0; i < this.#groups.length; i++) {
      let group = this.#groups[i]
      if (group.check(this.world)) {
        for (let j = 0; j < group.systems.length; j++) {
          let system = group.systems[j]
          if (
            !exists(system.predicate) ||
            system.predicate(this.world)
          ) {
            this.world.setResource(CurrentSystem, system)
            let systemMonitors = system.monitors.values()
            system.run(this.world)
            for (let k = 0; k < systemMonitors.length; k++) {
              let monitor = systemMonitors[k]
              monitor.drain()
            }
            this.world.emitStagedChanges()
          }
        }
      }
    }
    this.world.commitStagedChanges()
  }
}

export let makeApp = (world = new World()) => new App(world)
