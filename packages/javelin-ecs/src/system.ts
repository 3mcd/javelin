import {Maybe, SparseSet} from "@javelin/lib"
import {Monitor} from "./monitor.js"
import {Query} from "./query.js"
import {Predicate} from "./schedule.js"
import {World} from "./world.js"

export type SystemImpl = (world: World) => void

export class System {
  readonly isEnabled: (world: World) => boolean
  readonly monitors
  readonly queries
  readonly systemImpl

  constructor(systemImpl: SystemImpl, predicate?: Maybe<Predicate>) {
    this.isEnabled = predicate ?? (() => true)
    this.monitors = new SparseSet<Monitor>()
    this.queries = new SparseSet<Query>()
    this.systemImpl = systemImpl
  }
}
