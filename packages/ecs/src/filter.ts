import { Chunk, ChunkSet } from "./archetype"
import { Component } from "./component"

export interface FilterLike {
  matchChunkSet(chunk: ChunkSet): boolean
  matchChunk(chunk: Chunk): boolean
  matchComponent(component: Component): boolean
}

export abstract class Filter implements FilterLike {
  matchChunkSet(chunkSet: ChunkSet) {
    return true
  }
  matchChunk(chunk: Chunk) {
    return true
  }
  matchComponent(component: Component) {
    return true
  }
}
