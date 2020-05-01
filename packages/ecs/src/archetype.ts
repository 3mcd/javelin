import { Component } from "./component"
import { FilterLike } from "./filter"

export type Chunk<C extends Component = Component> = {
  version: number
  components: C[]
  tags: number
}

export type ChunkSet = {
  version: number
  chunks: (Chunk | null)[]
  size: number
  tags: number
}

export type ChunkLocation = {
  readonly chunkSetIndex: number
  readonly chunkIndex: number
}

export class Archetype {
  private maxChunkSetSize = 0
  readonly layout: number[]
  private chunkSets: ChunkSet[] = []

  constructor(maxChunkSetSize: number, componentTypes: number[]) {
    this.maxChunkSetSize = maxChunkSetSize
    this.layout = componentTypes.slice().sort((a, b) => a - b)
  }

  insert(components: Component[], tags = 0): ChunkLocation {
    const chunk = {
      version: 0,
      components: components.sort(
        (a, b) => this.layout.indexOf(a._t) - this.layout.indexOf(b._t),
      ),
      tags,
    }

    let chunkSetIndex = 0

    while (this.chunkSets[chunkSetIndex]) {
      const chunkSet = this.chunkSets[chunkSetIndex]

      if (
        chunkSet.size < this.maxChunkSetSize &&
        (tags & chunkSet.tags) === tags
      ) {
        let chunkIndex = 0

        while (chunkSet.chunks[chunkIndex] !== null) {
          chunkIndex++
        }

        chunkSet.chunks[chunkIndex] = chunk
        chunkSet.size += 1

        return { chunkSetIndex, chunkIndex }
      }

      chunkSetIndex++
    }

    const chunks = Array(this.maxChunkSetSize).fill(null)

    chunks[0] = chunk

    this.chunkSets[chunkSetIndex] = {
      version: 0,
      size: 1,
      chunks,
      tags,
    }

    return { chunkSetIndex, chunkIndex: 0 }
  }

  swap(chunkLocation: ChunkLocation, dest: Archetype) {
    const chunk = this._remove(chunkLocation)
    const destComponentLayout = dest.layout
    const destComponents = chunk.components
      .filter(c => destComponentLayout.includes(c._t))
      .sort(
        (a, b) =>
          destComponentLayout.indexOf(a._t) - destComponentLayout.indexOf(b._t),
      )

    if (destComponents.length !== destComponentLayout.length) {
      throw new Error(
        "Invalid swap. Target archetype is not a valid candidate.",
      )
    }

    const targetChunkLocation = dest.insert(destComponents, chunk.tags)

    return targetChunkLocation
  }

  private _remove(chunkLocation: ChunkLocation) {
    const { chunkSetIndex, chunkIndex } = chunkLocation
    const chunkSet = this.chunkSets[chunkSetIndex]
    const chunk = chunkSet.chunks[chunkIndex]

    if (chunk === null) {
      throw new Error("Chunk has been removed at location.")
    }

    chunkSet.size -= 1
    chunkSet.chunks[chunkLocation.chunkIndex] = null

    let tags = 0

    for (let i = 0; i < chunkSet.chunks.length; i++) {
      const chunk = chunkSet.chunks[i]

      if (chunk !== null) {
        tags |= chunk.tags
      }
    }

    chunkSet.tags = tags

    return chunk
  }

  remove(chunkLocation: ChunkLocation) {
    this._remove(chunkLocation)
  }

  incrementVersion(location: ChunkLocation, component: Component) {
    const { chunkSetIndex, chunkIndex } = location
    const chunkSet = this.chunkSets[chunkSetIndex]
    const chunk = chunkSet.chunks[chunkIndex]

    if (chunk === null) {
      throw new Error("Chunk has been removed at location.")
    }

    if (chunk.components[this.layout.indexOf(component._t)] !== component) {
      throw new Error("Invalid version increment. Component mismatch.")
    }

    chunkSet.version += 1
    chunk.version += 1
    component._v += 1
  }

  addTag(chunkLocation: ChunkLocation, tags: number) {
    const chunkSet = this.chunkSets[chunkLocation.chunkSetIndex]
    const chunk = chunkSet.chunks[chunkLocation.chunkIndex]

    if (chunk === null) {
      throw new Error("Chunk has been removed at location.")
    }

    chunkSet.tags |= tags
    chunk.tags |= tags
  }

  removeTag(chunkLocation: ChunkLocation, tags: number) {
    const chunkSet = this.chunkSets[chunkLocation.chunkSetIndex]
    const chunk = chunkSet.chunks[chunkLocation.chunkIndex]

    if (chunk === null) {
      throw new Error("Chunk has been removed at location.")
    }

    chunk.tags &= ~tags

    for (let i = 0; i < chunkSet.chunks.length; i++) {
      const chunk = chunkSet.chunks[i]

      if (chunk !== null && tags & chunk.tags) {
        return
      }
    }

    chunkSet.tags &= ~tags
  }

  hasTag(chunkLocation: ChunkLocation, tags: number) {
    const chunkSet = this.chunkSets[chunkLocation.chunkSetIndex]
    const chunk = chunkSet.chunks[chunkLocation.chunkIndex]

    if (chunk === null) {
      throw new Error("Chunk has been removed at location.")
    }

    return Boolean(tags & chunk.tags)
  }

  *read(filters: FilterLike[]) {
    const len = filters.length

    for (let chs = 0; chs < this.chunkSets.length; chs++) {
      const chunkSet = this.chunkSets[chs]

      let match = true
      for (let f = 0; f < len; f++) {
        if (!filters[f].matchChunkSet(chunkSet)) {
          match = false
          break
        }
      }
      if (!match) continue

      const { chunks } = chunkSet

      for (let ch = 0; ch < chunks.length; ch++) {
        const chunk = chunks[ch]

        if (chunk === null) {
          continue
        }

        let match = true
        for (let f = 0; f < len; f++) {
          if (!filters[f].matchChunk(chunk)) {
            match = false
            break
          }
        }
        if (!match) continue

        const { components } = chunk

        for (let c = 0; c < components.length; c++) {
          const component = components[c]

          for (let f = 0; f < len; f++) {
            if (!filters[f].matchComponent(component)) {
              match = false
              break
            }
          }
        }
        if (match) {
          yield components as ReadonlyArray<Component>
        }
      }
    }
  }
}
