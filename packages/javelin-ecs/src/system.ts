import {Maybe, SparseSet} from "@javelin/lib"
import {Monitor} from "./monitor.js"
import {Query} from "./query.js"
import {Predicate} from "./schedule.js"
import {World} from "./world.js"

export type SystemImpl = (world: World) => void

export class System {
  readonly run
  readonly monitors
  readonly queries

  readonly isEnabled: (world: World) => boolean

  constructor(run: SystemImpl, predicate?: Maybe<Predicate>) {
    this.run = run
    this.monitors = new SparseSet<Monitor>()
    this.queries = new SparseSet<Query>()
    this.isEnabled = predicate ?? (() => true)
  }
}
