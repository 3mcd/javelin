import { Archetype } from "./archetype"
import { Component } from "./component"

export class Storage {
  readonly archetypes: Archetype[] = []
  private locations: (number | null)[] = []
  private tags: number[] = []
  private nextEntity = 0

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
    const componentTypes = components.map(c => c._t)
    let archetype = this.findArchetype(componentTypes)

    if (!archetype) {
      archetype = new Archetype(componentTypes)
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

  insert(components: Component[], tags = 0) {
    const archetype = this.findOrCreateArchetype(components)
    const entity = this.nextEntity

    this.nextEntity++

    archetype.insert(entity, components)

    for (let i = 0; i < components.length; i++) {
      components[i]._e = entity
    }

    this.tags[entity] = tags
    this.locations[entity] = this.archetypes.indexOf(archetype)

    return entity
  }

  remove(entity: number) {
    const location = this.locations[entity]
    if (location === null) {
      throw new Error("Entity does not exist in Storage.")
    }
    const source = this.archetypes[location]
    if (source === undefined) {
      throw new Error("Invalid remove. Component archetype does not exist.")
    }
    source.remove(entity)
    this.locations[entity] = null
  }

  addTag(entity: number, tags: number) {
    this.tags[entity] |= tags
  }

  removeTag(entity: number, tags: number) {
    this.tags[entity] &= ~tags
  }

  hasTag(entity: number, tags: number) {
    return (this.tags[entity] & tags) === tags
  }

  incrementVersion(component: Component) {}
}
