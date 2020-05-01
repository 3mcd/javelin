import { Filter } from "../filter"
import { Chunk, ChunkSet } from "../archetype"
import { Component, ComponentSpec } from "../component"

export class Changed extends Filter {
  private visitedChunkSets = new WeakMap<ChunkSet, number>()
  private visitedChunks = new WeakMap<Chunk, number>()
  private visitedComponents = new WeakMap<Component, number>()
  private check = true
  private componentTypes: number

  constructor(componentSpecs: ComponentSpec[]) {
    super()
    this.check = componentSpecs.length > 0
    this.componentTypes = componentSpecs.reduce((a, c) => a | c.type, 0)
  }

  matchChunkSet(chunkSet: ChunkSet) {
    const version = this.visitedChunkSets.get(chunkSet) || 0
    this.visitedChunkSets.set(chunkSet, version)
    return chunkSet.version < version
  }

  matchChunk(chunk: Chunk) {
    const version = this.visitedChunks.get(chunk) || 0
    this.visitedChunks.set(chunk, version)
    return chunk.version < version
  }

  matchComponent(component: Component) {
    const version = this.visitedComponents.get(component) || 0

    if (this.check && (component._t & this.componentTypes) === 0) {
      return true
    }

    this.visitedComponents.set(component, version)

    return component._v < version
  }
}
