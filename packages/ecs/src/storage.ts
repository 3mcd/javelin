import { Archetype, createArchetype } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { ComponentFactoryLike } from "./helpers"

export interface Storage {
  /**
   * Collection of Archetypes in the world.
   */
  readonly archetypes: ReadonlyArray<Archetype>

  /**
   * Create a new entity.
   *
   * @param components Array of components to associate with the new entity
   * @param tag Initial tag (bit flags) of the entity
   */
  create(components: Component[], tag?: number): number

  /**
   * Insert components into an existing entity.
   *
   * @param entity Existing entity
   * @param components Components to insert into the existing entity
   */
  insert(entity: number, ...components: Component[]): void

  /**
   * Destroy an entity. Attempts to release pooled components if their types
   * have been registered via the `registerComponentFactory` method.
   *
   * @param entity Entity to destroy
   */
  destroy(entity: number): void

  /**
   * Tag an entity with a bit flag.
   *
   * @param entity Entity to add the tag to
   * @param tag Tag (bit flags)
   */
  addTag(entity: number, tag: number): void

  /**
   * Remove a tag from an entity.
   *
   * @param entity Entity to remove the flag from
   * @param tag Tag (bit flags)
   */
  removeTag(entity: number, tag: number): void

  /**
   * Check if an entity has a tag.
   *
   * @param entity Subject entity
   * @param tag Tag (bit flags)
   */
  hasTag(entity: number, tag: number): boolean

  /**
   * Increment the version of a component by 1 to indicate that it has been
   * modified.
   *
   * @param component Component to bump
   */
  incrementVersion(component: Component): void

  /**
   * Update a local version of a component from remote (e.g. server) source.
   *
   * @param component Latest copy of the component
   */
  patch(component: Component): boolean

  /**
   * Locate a component related to a specific entity.
   *
   * @param entity Subject entity
   * @param componentType Type of component to locate
   */
  findComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T>

  /**
   * Register a component factory to automatically release pooled components
   * when their entity is destroyed.
   *
   * @param factory Component factory to register
   */
  registerComponentFactory(factory: ComponentFactoryLike): void
}

export function createStorage(): Storage {
  const archetypes: Archetype[] = []
  // Array where the index corresponds to an entity and the value corresponds
  // to the index of the entity's archetype within the `archetypes` array. When
  // mutating or reading components, we always assume the location is valid
  // since it is kept in sync with the entity's archetype via the `create`,
  // `insert`, and `remove` methods.
  const archetypeIndicesByEntity: (number | null)[] = []
  const tagsByEntity: number[] = []
  const factoriesByType = new Map<number, ComponentFactoryLike>()

  let nextEntity = 0

  /**
   * Locate an archetype for a collection of components.
   *
   * @param components Components that archetype would contain
   */
  function findArchetype(components: Component[]) {
    const len = components.length

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
      const { layout } = archetype

      // Verify archetype has same number of components as predicate.
      if (layout.length !== len) {
        continue
      }

      let match = true

      for (let j = 0; j < len; j++) {
        // Affirm that archetype contains each component of predicate.
        if (layout.indexOf(components[j]._t) === -1) {
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

  /**
   * Locate or create an archetype for a collection of components.
   *
   * @param components Components that archetype would contain
   */
  function findOrCreateArchetype(components: Component[]) {
    let archetype = findArchetype(components)

    if (!archetype) {
      archetype = createArchetype(components.map(c => c._t))
      archetypes.push(archetype)
    }

    return archetype
  }

  function create(components: Component[], tag = 0) {
    const archetype = findOrCreateArchetype(components)
    const entity = nextEntity++

    archetype.insert(entity, components)

    for (let i = 0; i < components.length; i++) {
      const component = components[i]

      component._e = entity
      component._v = 0
    }

    tagsByEntity[entity] = tag
    archetypeIndicesByEntity[entity] = archetypes.indexOf(archetype)

    return entity
  }

  function insert(entity: number, ...components: Component[]) {
    const location = archetypeIndicesByEntity[entity]

    if (location === undefined) {
      throw new Error("Cannot insert components. Entity does not exist.")
    }

    if (location === null) {
      throw new Error("Cannot insert components. Entity has been removed.")
    }

    const source = archetypes[location]
    const entityIndex = source.indices[entity]

    let destinationComponents = components.slice() as Readonly<Component>[]

    for (let i = 0; i < source.layout.length; i++) {
      // UNSAFE: `!` is used because entity location is non-null.
      destinationComponents.push(source.table[i][entityIndex]!)
    }

    source.remove(entity)

    const destination = findOrCreateArchetype(destinationComponents)

    destination.insert(entity, destinationComponents)
    archetypeIndicesByEntity[entity] = archetypes.indexOf(destination)
  }

  function destroy(entity: number) {
    const location = archetypeIndicesByEntity[entity]

    if (location === null) {
      throw new Error("Entity does not exist in Storage.")
    }

    const source = archetypes[location]

    if (source === undefined) {
      throw new Error("Invalid remove. Component archetype does not exist.")
    }

    for (let i = 0; i < source.layout.length; i++) {
      const type = source.layout[i]
      const factory = factoriesByType.get(type)

      if (factory !== undefined) {
        // UNSAFE: `!` is used because entity location is non-null.
        const component = source.table[i][source.indices[entity]]!

        factory.destroy(component)
      }
    }

    source.remove(entity)
    archetypeIndicesByEntity[entity] = null
  }

  function addTag(entity: number, tag: number) {
    tagsByEntity[entity] |= tag
  }

  function removeTag(entity: number, tag: number) {
    tagsByEntity[entity] &= ~tag
  }

  function hasTag(entity: number, tag: number) {
    return (tagsByEntity[entity] & tag) === tag
  }

  function incrementVersion(component: Component) {
    component._v++
  }

  function patch(component: Component) {
    const { _e, _t } = component

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
      const entityIndex = archetype.indices[_e]

      if (entityIndex !== -1 && entityIndex !== undefined) {
        const componentIndex = archetype.layout.indexOf(_t)

        // Apply patch to component.
        Object.assign(archetype.table[componentIndex][entityIndex], component)

        return true
      }
    }

    return false
  }

  function findComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ) {
    const location = archetypeIndicesByEntity[entity]

    if (location === null) {
      throw new Error("Failed to find component. Entity does not exist")
    }

    const archetype = archetypes[location]
    const componentIndex = archetype.layout.indexOf(componentType.type)

    if (componentIndex === -1) {
      throw new Error(
        "Failed to find component. Component could not exist with entity.",
      )
    }

    const entityIndex = archetype.indices[entity]

    // UNSAFE: `!` is used because entity location is non-null.
    return archetype.table[componentIndex][entityIndex]! as ComponentOf<T>
  }

  function registerComponentFactory(factory: ComponentFactoryLike) {
    factoriesByType.set(factory.type, factory)
  }

  return {
    create,
    insert,
    destroy,
    addTag,
    removeTag,
    hasTag,
    archetypes,
    incrementVersion,
    findComponent,
    patch,
    registerComponentFactory,
  }
}
