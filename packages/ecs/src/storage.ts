import { Archetype, ChunkLocation } from "./archetype"
import { Component } from "./component"

type EntityLocation = ChunkLocation & { archetype: number }

export class Storage {
  readonly archetypes: Archetype[] = []
  private maxChunkSetSize: number
  private entityLocations: (EntityLocation | null)[] = []

  constructor(maxChunkSetSize: number = 100) {
    this.maxChunkSetSize = maxChunkSetSize
  }

  private findArchetype(componentTypes: number[]) {
    const len = componentTypes.length

    for (let i = 0; i < this.archetypes.length; i++) {
      const archetype = this.archetypes[i]
      const { layout } = archetype

      if (layout.length !== len) {
        continue
      }

      let match = true

      for (let j = 0; j < len; j++) {
        if (layout.indexOf(componentTypes[j]) === -1) {
          match = false
          break
        }
      }

      if (match) {
        return archetype
      }
    }

    return null
  }

  private findOrCreateArchetype(components: Component[]) {
    const layout = components.map(c => c._t)
    let archetype = this.findArchetype(layout)

    if (!archetype) {
      archetype = new Archetype(this.maxChunkSetSize, layout)
      this.archetypes.push(archetype)
    }

    return archetype
  }

  *getArchetypes(componentTypes: number[]) {
    for (let i = 0; i < this.archetypes.length; i++) {
      const archetype = this.archetypes[i]
      let match = true
      for (let j = 0; j < componentTypes.length; j++) {
        if (archetype.layout.indexOf(componentTypes[j]) === -1) {
          match = false
          break
        }
      }
      if (match) {
        yield archetype
      }
    }
  }

  insert(entity: number, components: Component[], tags = 0) {
    const archetype = this.findOrCreateArchetype(components)
    const chunkLocation = archetype.insert(components, tags)

    for (let i = 0; i < components.length; i++) {
      components[i]._e = entity
    }

    this.entityLocations[entity] = {
      ...chunkLocation,
      archetype: this.archetypes.indexOf(archetype),
    }

    return entity
  }

  add(entity: number, ...components: Component[]) {}

  remove(entity: number, ...components: Component[]) {
    const location = this.entityLocations[entity]

    if (location === null) {
      throw new Error("Entity does not exist in Storage.")
    }

    const source = this.archetypes[location.archetype]

    if (source === undefined) {
      throw new Error("Invalid remove. Component archetype does not exist.")
    }

    if (components.length > 0) {
      const dest = this.findOrCreateArchetype(components)
      const destChunkLocation = source.swap(location, dest)

      this.entityLocations[entity] = {
        ...destChunkLocation,
        archetype: this.archetypes.indexOf(dest),
      }
      return
    }

    source.remove(location)
    this.entityLocations[entity] = null
  }

  addTag(entity: number, tags: number) {
    const location = this.entityLocations[entity]

    if (location === null) {
      throw new Error("Cannot tag entity. Entity not registered.")
    }

    // UNSAFE: archetype should exist since a location cannot be generated
    // without a corresponding archetype.
    const archetype = this.archetypes[location.archetype]!

    archetype.addTag(location, tags)
  }

  removeTag(entity: number, tags: number) {
    const location = this.entityLocations[entity]

    if (location === null) {
      throw new Error("Cannot untag entity. Entity not registered.")
    }

    // UNSAFE: archetype should exist since a location cannot be generated
    // without a corresponding archetype.
    const archetype = this.archetypes[location.archetype]!

    archetype.removeTag(location, tags)
  }

  hasTag(entity: number, tags: number) {
    const location = this.entityLocations[entity]

    if (location === null) {
      throw new Error("Cannot read tags of entity. Entity not registered.")
    }

    // UNSAFE: archetype should exist since a location cannot be generated
    // without a corresponding archetype.
    const archetype = this.archetypes[location.archetype]!

    return archetype.hasTag(location, tags)
  }

  incrementVersion(component: Component) {
    const location = this.entityLocations[component._e]

    if (location === null) {
      throw new Error("Cannot tag entity. Entity not registered.")
    }

    // UNSAFE: archetype should exist since a location cannot be generated
    // without a corresponding archetype.
    const archetype = this.archetypes[location.archetype]!

    archetype.incrementVersion(location, component)
  }
}
