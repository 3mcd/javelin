import { Archetype, createArchetype } from "./archetype"
import { Component } from "./component"

export interface Storage {
  archetypes: ReadonlyArray<Archetype>
  insert(components: Component[], tag?: number): number
  remove(entity: number): void
  addTag(entity: number, tag: number): void
  removeTag(entity: number, tag: number): void
  hasTag(eentity: number, tag: number): boolean
  incrementVersion(component: Component): void
}

export function createStorage(): Storage {
  const archetypes: Archetype[] = []
  const locations: (number | null)[] = []
  const tags: number[] = []

  let nextEntity = 0

  function findArchetype(componentTypes: number[]) {
    const len = componentTypes.length

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
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

  function findOrCreateArchetype(components: Component[]) {
    const componentTypes = components.map(c => c._t)
    let archetype = findArchetype(componentTypes)

    if (!archetype) {
      archetype = createArchetype(componentTypes)
      archetypes.push(archetype)
    }

    return archetype
  }

  function insert(components: Component[], tag = 0) {
    const archetype = findOrCreateArchetype(components)
    const entity = nextEntity

    nextEntity++

    archetype.insert(entity, components)

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      component._e = entity
      component._v = 0
    }

    tags[entity] = tag
    locations[entity] = archetypes.indexOf(archetype)

    return entity
  }

  function remove(entity: number) {
    const location = locations[entity]

    if (location === null) {
      throw new Error("Entity does not exist in Storage.")
    }

    const source = archetypes[location]

    if (source === undefined) {
      throw new Error("Invalid remove. Component archetype does not exist.")
    }

    source.remove(entity)
    locations[entity] = null
  }

  function addTag(entity: number, tag: number) {
    tags[entity] |= tag
  }

  function removeTag(entity: number, tag: number) {
    tags[entity] &= ~tag
  }

  function hasTag(entity: number, tag: number) {
    return (tags[entity] & tag) === tag
  }

  function incrementVersion(component: Component) {
    component._v++
  }

  return {
    insert,
    remove,
    addTag,
    removeTag,
    hasTag,
    archetypes,
    incrementVersion,
  }
}
