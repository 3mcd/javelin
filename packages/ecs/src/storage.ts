import { Archetype, createArchetype } from "./archetype"
import {
  Component,
  ComponentOf,
  ComponentType,
  ComponentSpec,
} from "./component"
import { ComponentFactoryLike } from "./helpers"

export interface Storage {
  /**
   * Create a new entity.
   *
   * @param entity Entity
   * @param components Array of components to associate with the entity
   * @param tag Initial tag (bit flags) of the entity
   */
  create(entity: number, components: ComponentSpec[], tag?: number): number

  /**
   * Associate components with an entity.
   *
   * @param entity Entity
   * @param components Components to insert
   */
  insert(entity: number, components: ComponentSpec[]): void

  /**
   * Insert or update a component (e.g. from a remote source).
   *
   * @param component Latest copy of the component
   */
  upsert(component: Component): void

  /**
   * Remove components from an entity.
   *
   * @param entity Entity
   * @param components Components to remove
   */
  remove(entity: number, components: ComponentSpec[]): void

  /**
   * Destroy an entity. Attempts to release pooled components if their types
   * have been registered via the `registerComponentFactory` method.
   *
   * @param entity Subject entity
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

  /**
   * Collection of Archetypes in the world.
   */
  readonly archetypes: ReadonlyArray<Archetype>
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

  function create(entity: number, components: Component[], tag = 0) {
    const archetype = findOrCreateArchetype(components)

    archetype.insert(entity, components)

    tagsByEntity[entity] = tag
    archetypeIndicesByEntity[entity] = archetypes.indexOf(archetype)

    return entity
  }

  function getEntityArchetype(entity: number, operation: string) {
    const location = archetypeIndicesByEntity[entity]

    if (location === undefined) {
      throw new Error(`Failed to ${operation}. Entity does not exist.`)
    }

    if (location === null) {
      throw new Error(`Failed to ${operation}. Entity has been removed.`)
    }

    return archetypes[location]
  }

  function relocate(
    source: Archetype,
    entity: number,
    components: Component[],
  ) {
    source.remove(entity)

    const destination = findOrCreateArchetype(components)

    destination.insert(entity, components)
    archetypeIndicesByEntity[entity] = archetypes.indexOf(destination)
  }

  function insert(entity: number, components: Component[]) {
    const source = getEntityArchetype(entity, "insert components")
    const entityIndex = source.indices[entity]

    let destinationComponents = components.slice() as Readonly<Component>[]

    for (let i = 0; i < source.layout.length; i++) {
      // UNSAFE: `!` is used because entity location is non-null.
      destinationComponents.push(source.table[i][entityIndex]!)
    }

    relocate(source, entity, destinationComponents)
  }

  function remove(entity: number, components: Component[]) {
    const source = getEntityArchetype(entity, "remove components")
    const entityIndex = source.indices[entity]
    const typesToRemove = components.map(component => component._t)

    let destinationComponents = []

    for (let i = 0; i < source.layout.length; i++) {
      const type = source.layout[i]
      if (!typesToRemove.includes(type)) {
        destinationComponents.push(source.table[i][entityIndex]!)
      }
    }

    relocate(source, entity, destinationComponents)
  }

  function destroy(entity: number) {
    const source = getEntityArchetype(entity, "destroy entity")

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

  function upsert(component: Component) {
    const { _e: entity, _t: type } = component
    const archetype = getEntityArchetype(entity, "patch component")
    const entityIndex = archetype.indices[entity]
    const componentIndex = archetype.layout.indexOf(type)

    if (componentIndex === -1) {
      // Entity component makeup does not match patch component, insert the new
      // component.
      insert(entity, [component])
      return
    }

    const targetComponent = archetype.table[componentIndex][entityIndex]!

    // Apply patch to component.
    Object.assign(targetComponent, component)
    incrementVersion(targetComponent)
  }

  function findComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ) {
    const archetype = getEntityArchetype(entity, "find component")
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
    remove,
    destroy,
    addTag,
    removeTag,
    hasTag,
    archetypes,
    incrementVersion,
    findComponent,
    upsert,
    registerComponentFactory,
  }
}
