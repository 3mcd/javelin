import {
  component,
  Monitor,
  Node,
  Term,
  Type,
  World,
  PhaseId,
} from "@javelin/ecs"
import {exists} from "@javelin/lib"
import {NetworkModel} from "../network_resources.js"
import {NetworkTransport} from "../network_transport.js"
import {WriteStream} from "../stream/write_stream.js"

const UPDATE = 0

export let Awareness = component<Awareness>()
export let AwarenessState = component<AwarenessState>()

export interface Awareness {
  readonly interests: Interest[]
}

export interface AwarenessState {
  readonly interests: InterestState[]
  dispose(): void
}

export class InterestState {
  #interest
  #stream
  #monitor

  constructor(
    node: Node,
    excluded_terms: Term[],
    interest: Interest,
  ) {
    this.#monitor = new Monitor(node, PhaseId.Commit, excluded_terms) // get exclcuded terms and final type?!
    this.#interest = interest
    this.#stream = new WriteStream(
      1 + 4 + 4 + 4 + interest.type.components.length * 4,
    )
    node.on_node_deleted.add(deleted_node => {
      if (deleted_node == node) {
        this.dispose()
      }
    })
  }

  update(
    network_model: NetworkModel,
    network_transport: NetworkTransport,
  ) {
    let {included_size, excluded_size} = this.#monitor
    if (included_size > 0 || excluded_size > 0) {
      let sorted_terms = this.#interest.type.components
      this.#stream.reset()
      this.#stream.write_u8(UPDATE)
      this.#stream.write_u32(sorted_terms.length)
      for (let i = 0; i < sorted_terms.length; i++) {
        let term = sorted_terms[i]
        let term_iso = network_model.to_iso(term)
        if (exists(term_iso)) {
          this.#stream.write_u32(term_iso)
        }
      }
      this.#stream.write_u32(included_size)
      this.#stream.write_u32(excluded_size)
      this.#stream.grow(excluded_size * 4 + included_size * 4)
      this.#monitor
        .each_included(entity => {
          this.#stream.write_u32(entity)
        })
        .each_excluded(entity => {
          this.#stream.write_u32(entity)
        })
      network_transport.send(this.#stream.bytes, UPDATE)
    }
    this.#monitor.drain()
  }

  dispose() {
    this.#monitor.dispose()
    this.#monitor = undefined!
  }
}

export class AwarenessStateImpl implements AwarenessState {
  readonly interests

  constructor(world: World, awareness: Awareness) {
    this.interests = awareness.interests.map(interest => {
      let node = world.graph.node_of_type(interest.type)
      return new InterestState(node, [], interest)
    })
  }

  dispose() {
    for (let i = 0; i < this.interests.length; i++) {
      let interest = this.interests[i]
      interest.dispose()
    }
  }
}

export class Interest {
  readonly type

  constructor(type: Type) {
    this.type = type
  }
}

export class AwarenessImpl implements Awareness {
  readonly interests

  constructor() {
    this.interests = [] as Interest[]
  }

  add_interest(interest: Interest) {
    this.interests.push(interest)
    return this
  }
}
