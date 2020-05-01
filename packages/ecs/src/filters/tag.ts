import { Chunk, ChunkSet } from "../archetype"
import { Filter } from "../filter"

export class Tag extends Filter {
  private tags: number

  constructor(tags: number) {
    super()
    this.tags = tags
  }

  matchChunkSet(chunkSet: ChunkSet) {
    return (this.tags & chunkSet.tags) === this.tags
  }
  matchChunk(chunk: Chunk) {
    return (this.tags & chunk.tags) === this.tags
  }
}
