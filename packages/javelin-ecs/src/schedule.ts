import {assert, exists, expect, Maybe} from "@javelin/lib"
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
    this.#vertices = new Map<T, Set<T>>()
  }

  #dependencies(task: T) {
    let edges = this.#vertices.get(task)
    if (!exists(edges)) {
      edges = new Set()
      this.#vertices.set(task, edges)
    }
    return edges
  }

  #sort(vertex: T, degree: number, degrees: Map<T, number>, visited: Set<T>) {
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
    this.#dependencies(task).add(dependency)
  }

  remove(task: T) {
    this.#vertices.delete(task)
    this.#vertices.forEach(vertex => {
      vertex.delete(task)
    })
  }

  build() {
    let vertices = Array.from(this.#vertices.keys())
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

export class SystemGroup {
  #predicate
  #systemSchedule
  #systemScheduleStale
  #systems
  #systemsByImpl

  constructor(predicate?: Maybe<Predicate>) {
    this.#systemScheduleStale = false
    this.#systemSchedule = new Schedule<SystemImpl>()
    this.#systemsByImpl = new Map<SystemImpl, System>()
    this.#predicate = predicate
    this.#systems = [] as System[]
  }

  get systems() {
    return this.#systems
  }

  addSystem(
    impl: SystemImpl,
    constraints?: Maybe<Constraints<SystemImpl>>,
    predicate?: Maybe<Predicate>,
  ) {
    let system = new System(impl, predicate)
    assert(!this.#systemsByImpl.has(impl))
    this.#systemsByImpl.set(impl, system)
    this.#systemScheduleStale = true
    Constraints.insert(
      this.#systemSchedule,
      impl,
      constraints ?? new Constraints<SystemImpl>(),
    )
  }

  removeSystem(impl: SystemImpl) {
    this.#systemsByImpl.delete(impl)
    this.#systemSchedule.remove(impl)
    this.#systemScheduleStale = true
  }

  isEnabled(world: World) {
    if (this.#systemScheduleStale) {
      this.#systems = this.#systemSchedule
        .build()
        .map(impl => expect(this.#systemsByImpl.get(impl)))
      this.#systemScheduleStale = false
    }
    return this.#predicate?.(world) ?? true
  }
}

export function makeConstraintsWithBefore<T>(task: T): Constraints<T> {
  return new Constraints<T>().before(task)
}

export function makeConstraintsWithAfter<T>(task: T): Constraints<T> {
  return new Constraints<T>().after(task)
}
