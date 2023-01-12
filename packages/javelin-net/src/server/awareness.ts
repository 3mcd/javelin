import {
  value,
  Monitor,
  Node,
  Component,
  Type,
  World,
  Phase,
} from "@javelin/ecs"
import {exists} from "@javelin/lib"
import {NetworkModel} from "../network_resources.js"
import {NetworkTransport} from "../network_transport.js"
import {WriteStream} from "../stream/write_stream.js"

const UPDATE = 0

export let Awareness = value<Awareness>()
export let AwarenessState = value<AwarenessState>()

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
    excludedComponents: Component[],
    interest: Interest,
  ) {
    this.#monitor = new Monitor(node, Phase.Apply, excludedComponents) // get exclcuded terms and final type?!
    this.#interest = interest
    this.#stream = new WriteStream(
      1 + 4 + 4 + 4 + interest.type.components.length * 4,
    )
    node.onNodeDeleted.add(deletedNode => {
      if (deletedNode == node) {
        this.dispose()
      }
    })
  }

  update(
    networkModel: NetworkModel,
    networkTransport: NetworkTransport,
  ) {
    if (!this.#monitor) {
      return
    }
    let {includedSize, excludedSize} = this.#monitor
    if (includedSize > 0 || excludedSize > 0) {
      let sortedComponents = this.#interest.type.components
      this.#stream.reset()
      this.#stream.writeU8(UPDATE)
      this.#stream.writeU32(sortedComponents.length)
      for (let i = 0; i < sortedComponents.length; i++) {
        let term = sortedComponents[i]
        let termIso = networkModel.localComponentToIso(term)
        if (exists(termIso)) {
          this.#stream.writeU32(termIso)
        }
      }
      this.#stream.writeU32(includedSize)
      this.#stream.writeU32(excludedSize)
      this.#stream.grow(excludedSize * 4 + includedSize * 4)
      this.#monitor
        .eachIncluded(entity => {
          this.#stream.writeU32(entity)
        })
        .eachExcluded(entity => {
          this.#stream.writeU32(entity)
        })
      networkTransport.send(this.#stream.bytes, UPDATE)
    }
    this.#monitor.clear()
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
      let node = world.graph.nodeOfType(interest.type)
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

  addInterest(interest: Interest) {
    this.interests.push(interest)
    return this
  }
}
