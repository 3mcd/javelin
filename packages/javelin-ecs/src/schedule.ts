import {assert, expect, Maybe} from "@javelin/lib"
import {System, SystemImpl} from "./system.js"
import {World} from "./world.js"

export type Predicate = (world: World) => boolean

export type Constraint<T> = {
  kind: "before" | "after"
  task: T
}

export class Constraints<T> {
  #constraints

  static insert<T>(
    schedule: Schedule<T>,
    task: T,
    constraints: Constraints<T>,
  ) {
    schedule.ensure(task)
    for (let constraint of constraints) {
      if (constraint.kind === "before") {
        schedule.add(task, constraint.task)
      } else {
        schedule.add(constraint.task, task)
      }
    }
  }

  constructor() {
    this.#constraints = [] as Constraint<T>[]
  }

  *[Symbol.iterator]() {
    yield* this.#constraints
  }

  before(task: T) {
    this.#constraints.push({kind: "before", task})
    return this
  }

  after(task: T) {
    this.#constraints.push({kind: "after", task})
    return this
  }
}

export class Schedule<T> {
  #vertices

  constructor() {
    this.#vertices = new Map<T, T[]>()
  }

  #dependencies(task: T) {
    let edges = this.#vertices.get(task)
    if (edges === undefined) {
      this.#vertices.set(task, (edges = []))
    }
    return edges
  }

  #sort(
    vertex: T,
    degree: number,
    degrees: Map<T, number>,
    visited: Set<T>,
  ) {
    visited.add(vertex)
    let neighbors = this.#dependencies(vertex)
    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        degree = this.#sort(neighbor, degree, degrees, visited)
      }
    }
    degrees.set(vertex, degree)
    return degree - 1
  }

  ensure(task: T) {
    this.#dependencies(task)
  }

  add(task: T, dependency: T) {
    this.#dependencies(task).push(dependency)
  }

  build() {
    let vertices = [...this.#vertices.keys()]
    let visited = new Set<T>()
    let degrees = new Map<T, number>()
    let degree = vertices.length - 1
    for (let vertex of vertices) {
      if (!visited.has(vertex)) {
        degree = this.#sort(vertex, degree, degrees, visited)
      }
    }
    return Array.from(degrees.entries())
      .sort(([, a], [, b]) => a - b)
      .map(([t]) => t)
  }
}

export class Group {
  #predicate
  #system_schedule
  #system_schedule_stale
  #systems
  #systems_by_impl

  constructor(predicate?: Maybe<Predicate>) {
    this.#system_schedule_stale = false
    this.#system_schedule = new Schedule<SystemImpl>()
    this.#systems_by_impl = new Map<SystemImpl, System>()
    this.#predicate = predicate
    this.#systems = [] as System[]
  }

  get systems() {
    return this.#systems
  }

  add_system(
    impl: SystemImpl,
    constraints = new Constraints<SystemImpl>(),
    predicate?: Maybe<Predicate>,
  ) {
    let system = new System(impl, predicate)
    assert(!this.#systems_by_impl.has(impl))
    this.#systems_by_impl.set(impl, system)
    this.#system_schedule_stale = true
    Constraints.insert(this.#system_schedule, impl, constraints)
  }

  check(world: World) {
    if (this.#system_schedule_stale) {
      this.#systems = this.#system_schedule
        .build()
        .map(impl => expect(this.#systems_by_impl.get(impl)))
      this.#system_schedule_stale = false
    }
    return this.#predicate?.(world) ?? true
  }
}
