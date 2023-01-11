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

let default_plugin = (app: App) => {
  let init_flag = true
  app
    .add_group(
      DefaultGroup.Init,
      _ => _.before(DefaultGroup.Early),
      () => init_flag,
    )
    .add_group(DefaultGroup.Early, _ =>
      _.after(DefaultGroup.Init).before(DefaultGroup.EarlyUpdate),
    )
    .add_group(DefaultGroup.EarlyUpdate, _ =>
      _.after(DefaultGroup.Early).before(DefaultGroup.Update),
    )
    .add_group(DefaultGroup.Update, _ =>
      _.after(DefaultGroup.EarlyUpdate).before(
        DefaultGroup.LateUpdate,
      ),
    )
    .add_group(DefaultGroup.LateUpdate, _ =>
      _.after(DefaultGroup.Update).before(DefaultGroup.Late),
    )
    .add_group(DefaultGroup.Late, _ =>
      _.after(DefaultGroup.LateUpdate),
    )
    .add_system_to_group(DefaultGroup.Init, () => (init_flag = false))
}

export class App {
  #group_schedule_stale
  #group_schedule
  #groups
  #groups_by_id

  readonly world: World

  constructor(world: World) {
    this.#group_schedule = new Schedule<string>()
    this.#groups_by_id = new Map<string, Group>()
    this.#groups = [] as Group[]
    this.#group_schedule_stale = true
    this.world = world
    this.use(default_plugin)
  }

  use(plugin: Plugin): App {
    plugin(this)
    return this
  }

  add_resource<T>(resource: Resource<T>, value: T): App {
    assert(!this.world.has_resource(resource))
    this.world.set_resource(resource, value)
    return this
  }

  get_resource<T>(resource: Resource<T>): Maybe<T> {
    return this.world.get_resource(resource)
  }

  add_group(
    group_id: string,
    constrain?: Constrain<string>,
    criteria?: Maybe<Predicate>,
  ) {
    expect(!this.#groups_by_id.has(group_id))
    let group = new Group(criteria)
    let constraints = new Constraints<string>()
    this.#groups_by_id.set(group_id, group)
    constrain?.(constraints)
    Constraints.insert(this.#group_schedule, group_id, constraints)
    this.#group_schedule_stale = true
    return this
  }

  add_system(
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    criteria?: Maybe<Predicate>,
  ): App {
    this.add_system_to_group(
      DefaultGroup.Update,
      system,
      constrain,
      criteria,
    )
    return this
  }

  add_system_to_group(
    group_id: string,
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    criteria?: Maybe<Predicate>,
  ): App {
    let group = expect(this.#groups_by_id.get(group_id))
    group.add_system(system, constrain?.(new Constraints()), criteria)
    return this
  }

  add_init_system(
    system: SystemImpl,
    constrain?: Maybe<Constrain<SystemImpl>>,
    criteria?: Maybe<Predicate>,
  ) {
    this.add_system_to_group(
      DefaultGroup.Init,
      system,
      constrain,
      criteria,
    )
    return this
  }

  step(): void {
    if (this.#group_schedule_stale) {
      let groups = this.#group_schedule.build()
      this.#groups = groups.map(group_id =>
        expect(this.#groups_by_id.get(group_id)),
      )
      this.#group_schedule_stale = false
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
            this.world.set_resource(CurrentSystem, system)
            let monitors = system.monitors.values()
            for (let k = 0; k < monitors.length; k++) {
              let monitor = monitors[k]
              monitor.drain()
            }
            system.run(this.world)
            this.world.emit_staged_changes()
          }
        }
      }
    }
    this.world.commit_staged_changes()
  }
}

export let make_app = (world = new World()) => new App(world)
