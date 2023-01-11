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
  let initFlag = true
  app
    .addGroup(
      DefaultGroup.Init,
      _ => _.before(DefaultGroup.Early),
      () => initFlag,
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
    .addSystemToGroup(DefaultGroup.Init, () => (initFlag = false))
}

export class App {
  #groupScheduleStale
  #groupSchedule
  #groups
  #groupsById

  readonly world: World

  constructor(world: World) {
    this.#groupSchedule = new Schedule<string>()
    this.#groupsById = new Map<string, Group>()
    this.#groups = [] as Group[]
    this.#groupScheduleStale = true
    this.world = world
    this.use(defaultPlugin)
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

  addGroup(
    groupId: string,
    constrain?: Constrain<string>,
    criteria?: Maybe<Predicate>,
  ) {
    expect(!this.#groupsById.has(groupId))
    let group = new Group(criteria)
    let constraints = new Constraints<string>()
    this.#groupsById.set(groupId, group)
    constrain?.(constraints)
    Constraints.insert(this.#groupSchedule, groupId, constraints)
    this.#groupScheduleStale = true
    return this
  }

  addSystem(
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    criteria?: Maybe<Predicate>,
  ): App {
    this.addSystemToGroup(
      DefaultGroup.Update,
      system,
      constrain,
      criteria,
    )
    return this
  }

  addSystemToGroup(
    groupId: string,
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    criteria?: Maybe<Predicate>,
  ): App {
    let group = expect(this.#groupsById.get(groupId))
    group.addSystem(system, constrain?.(new Constraints()), criteria)
    return this
  }

  addInitSystem(
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    criteria?: Maybe<Predicate>,
  ) {
    this.addSystemToGroup(
      DefaultGroup.Init,
      system,
      constrain,
      criteria,
    )
    return this
  }

  step(): void {
    if (this.#groupScheduleStale) {
      let groups = this.#groupSchedule.build()
      this.#groups = groups.map(groupId =>
        expect(this.#groupsById.get(groupId)),
      )
      this.#groupScheduleStale = false
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
            let monitors = system.monitors.values()
            for (let k = 0; k < monitors.length; k++) {
              let monitor = monitors[k]
              monitor.drain()
            }
            system.run(this.world)
            this.world.emitStagedChanges()
          }
        }
      }
    }
    this.world.commitStagedChanges()
  }
}

export let makeApp = (world = new World()) => new App(world)
