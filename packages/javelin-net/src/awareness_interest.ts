import {Selector, World} from "@javelin/ecs"
import {Protocol} from "./protocol.js"
import {ReadStream} from "./read_stream.js"
import {WriteStream} from "./write_stream.js"

let tmpSelectorComponents = [] as number[]

export const interestMessageType = {
  encode(stream: WriteStream, world: World, interest: Interest) {
    stream.grow(interest.metaSize)
    stream.writeU32(interest.selectors.length)
    for (let i = 0; i < interest.selectors.length; i++) {
      let selector = interest.selectors[i]
      let {components} = selector.type
      stream.writeU32(components.length)
      for (let j = 0; j < components.length; j++) {
        stream.writeU32(components[j])
      }
      let monitor = world.monitor(selector)
      stream.writeU32(monitor.includedSize)
      stream.writeU32(monitor.excludedSize)
      stream.grow((monitor.includedSize + monitor.excludedSize) * 4)
      monitor
        .eachIncluded(entity => {
          stream.writeU32(entity)
        })
        .eachExcluded(entity => {
          stream.writeU32(entity)
        })
    }
  },
  decode(stream: ReadStream, world: World) {
    let selectorLength = stream.readU32()
    for (let i = 0; i < selectorLength; i++) {
      let selectorComponentsLength = stream.readU32()
      for (let j = 0; j < selectorComponentsLength; j++) {
        tmpSelectorComponents[j] = stream.readU32()
      }
      let includedSize = stream.readU32()
      let excludedSize = stream.readU32()
      for (let j = 0; j < includedSize; j++) {
        let entity = stream.readU32()
        console.log(entity)
      }
      for (let j = 0; j < excludedSize; j++) {
        let entity = stream.readU32()
        console.log(entity)
      }
    }
  },
}

export class Interest {
  readonly selectors: Selector[]
  readonly metaSize

  constructor(selectors: Selector[]) {
    this.selectors = selectors
    this.metaSize =
      4 +
      selectors.length * // interest.selectors.length
        (4 + // selector.components.length
          4 + // monitor.includedSize
          4) // monitor.excludedSize
    for (let i = 0; i < selectors.length; i++) {
      let selector = selectors[i]
      this.metaSize += selector.type.components.length * 4
    }
  }

  update(world: World, protocol: Protocol, stream: WriteStream) {
    protocol.encode(interestMessageType, this, world, stream)
  }
}

export function makeInterest(...selectors: Selector[]) {
  return new Interest(selectors)
}
