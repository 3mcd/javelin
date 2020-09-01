import {
  Component,
  ComponentInitializerArgs,
  ComponentOf,
  ComponentSpec,
  ComponentType,
} from "./component"
import { createComponentPool } from "./helpers"
import { createStackPool, StackPool } from "./pool"
import { initializeComponentFromSchema } from "./schema"
import { createStorage, Storage } from "./storage"
import { $worldStorageKey, $detached } from "./symbols"
import { Mutable } from "./types"
import { mutableEmpty } from "./util"
import {
  AttachOp,
  DestroyOp,
  DetachOp,
  SpawnOp,
  WorldOp,
  WorldOpType,
} from "./world_op"

export interface World<T = any> {
  /**
   * Move the world forward one tick by executing all systems in order with the
   * provided tick data.
   *
   * @param data Tick data
   */
  tick(data: T): void

  /**
   * Register a system to be executed each tick.
   *
   * @param system
   */
  addSystem(system: System<T>): void

  /**
   * Create an entity with a provided component makeup.
   *
   * @param components The new entity's components
   */
  spawn(...components: ReadonlyArray<ComponentSpec>): number

  /**
   * Create a component.
   *
   * @param componentType component type
   * @param args component type initializer arguments
   */
  component<T extends ComponentType>(
    componentType: T,
    ...args: ComponentInitializerArgs<T>
  ): ComponentOf<T>

  /**
   * Attach new components to an entity.
   *
   * @param entity Subject entity
   * @param components Components to insert
   */
  attach(entity: number, ...components: ReadonlyArray<Component>): void

  /**
   * Remove existing components from an entity.
   *
   * @param entity Subject entity
   * @param components Components to insert
   */
  detach(entity: number, ...components: ReadonlyArray<Component>): void

  /**
   * Destroy an entity and de-reference its components.
   *
   * @param entity Subject entity
   */
  destroy(entity: number): void

  /**
   * Retrieve a component by type for an entity. Throws an error if component is not found.
   *
   * @param entity
   * @param componentType
   */
  getComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T>

  /**
   * Retrieve a component by type for an entity, or null if a component is not found.
   *
   * @param entity
   * @param componentType
   */
  tryGetComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> | null

  /**
   * Determine if a component was changed last tick.
   *
   * @param component Component
   */
  isComponentChanged(component: Component): boolean

  /**
   * Get a mutable reference to a component.
   *
   * @param component Subject component
   */
  getObservedComponent<C extends Component>(component: C): C

  /**
   * Register a component factory with the world, automatically pooling its
   * components.
   *
   * @param factory Component factory
   */
  registerComponentType(factory: ComponentType): void

  /**
   * Apply world ops to this world.
   *
   * @param ops WorldOps to apply
   */
  applyOps(ops: WorldOp[]): void

  applyComponentPatch(
    entity: number,
    componentType: number,
    path: string,
    value: unknown,
  ): void

  /**
   * Entity-component storage.
   */
  readonly [$worldStorageKey]: Storage

  /**
   * Set of WorldOps that were processed last tick.
   */
  readonly ops: ReadonlyArray<WorldOp>

  /**
   * Array of registered component factories.
   */
  readonly componentTypes: ReadonlyArray<ComponentType>

  /**
   * Set of components attached last tick.
   */
  readonly attached: ReadonlySet<Component>
}

export type System<T> = (world: World<T>, data: T) => void

type WorldOptions<T> = {
  systems?: System<T>[]
  componentTypes?: ComponentType[]
  componentPoolSize?: number
}

export const createWorld = <T>(options: WorldOptions<T> = {}): World<T> => {
  const {
    systems = [],
    componentTypes: componentTypesConfig = [],
    componentPoolSize = 1000,
  } = options
  const ops: WorldOp[] = []
  const previousOps: WorldOp[] = []
  const opPool = createStackPool<WorldOp>(
    () => ([] as any) as WorldOp,
    op => {
      mutableEmpty(op)
      return op
    },
    1000,
  )
  const componentPoolsByComponentTypeId = new Map<
    number,
    StackPool<Component>
  >()
  const storage = createStorage()
  const componentTypes: ComponentType[] = []
  const destroyed = new Set<number>()
  const attached = new Set<Component>()

  let entityCounter = 0

  for (let i = 0; i < componentTypesConfig.length; i++) {
    registerComponentType(componentTypesConfig[i])
  }

  function flagDetached(component: Component) {
    ;(component as any)[$detached] = true
  }

  function applyCreateOp(op: SpawnOp) {
    const [, entity, components] = op

    for (let i = 0; i < components.length; i++) {
      attached.add(components[i])
    }

    storage.create(entity, components as Component[])
  }

  function applyAttachOp(op: AttachOp) {
    const [, entity, components] = op

    for (let i = 0; i < components.length; i++) {
      attached.add(components[i])
    }

    storage.insert(entity, components as Component[])
  }

  function applyDetachOp(op: DetachOp) {
    const [, entity, componentTypeIds] = op
    const components = storage.getEntityComponents(entity)

    for (let i = 0; i < components.length; i++) {
      const component = components[i]

      if (componentTypeIds.includes(component.type)) {
        maybeReleaseComponent(component)
      }
    }

    storage.removeByTypeIds(entity, componentTypeIds as number[])
  }

  function applyDestroyOp(op: DestroyOp) {
    const [, entity] = op

    destroyed.add(entity)
  }

  function applyOp(op: WorldOp) {
    switch (op[0]) {
      case WorldOpType.Spawn: {
        applyCreateOp(op)
        break
      }
      case WorldOpType.Attach: {
        applyAttachOp(op)
        break
      }
      case WorldOpType.Detach: {
        applyDetachOp(op)
        break
      }
      case WorldOpType.Destroy: {
        applyDestroyOp(op)
        break
      }
      default:
        break
    }

    previousOps.push(op)
  }

  function maybeReleaseComponent(component: Component) {
    const pool = componentPoolsByComponentTypeId.get(component.type)

    if (pool) {
      pool.release(component)
    }
  }

  function internalDestroy(entity: number) {
    storage.getEntityComponents(entity).forEach(maybeReleaseComponent)
    storage.destroy(entity)
  }

  function tick(data: T) {
    // Clear change cache
    storage.clearMutations()

    // Clear world op history
    while (previousOps.length > 0) {
      opPool.release(previousOps.pop()!)
    }

    destroyed.forEach(internalDestroy)
    destroyed.clear()

    attached.clear()

    while (ops.length > 0) {
      applyOp(ops.pop()!)
    }

    // Execute systems
    for (let i = 0; i < systems.length; i++) {
      systems[i](world, data)
    }
  }

  function addSystem(system: System<T>) {
    systems.push(system)
  }

  function spawn(...components: ReadonlyArray<Component>) {
    const entity = entityCounter++
    const op = opPool.retain() as SpawnOp

    op[0] = WorldOpType.Spawn
    op[1] = entity
    op[2] = components

    ops.push(op)

    return entity
  }

  function component<T extends ComponentType>(
    componentType: T,
    ...args: ComponentInitializerArgs<T>
  ): ComponentOf<T> {
    const pool = componentPoolsByComponentTypeId.get(
      componentType.type,
    ) as StackPool<ComponentOf<T>>

    const component = pool
      ? pool.retain()
      : (initializeComponentFromSchema(
          { type: componentType.type },
          componentType.schema,
        ) as ComponentOf<T>)

    if (componentType.initialize) {
      componentType.initialize(component, ...args)
    }

    return component
  }

  function attach(entity: number, ...components: ReadonlyArray<Component>) {
    const op = opPool.retain() as AttachOp

    op[0] = WorldOpType.Attach
    op[1] = entity
    op[2] = components

    ops.push(op)
  }

  function detach(entity: number, ...components: ReadonlyArray<Component>) {
    const op = opPool.retain() as DetachOp

    op[0] = WorldOpType.Detach
    op[1] = entity
    op[2] = components.map(c => c.type)

    components.forEach(flagDetached)

    ops.push(op)
  }

  function destroy(entity: number) {
    const op = opPool.retain() as DestroyOp

    op[0] = WorldOpType.Destroy
    op[1] = entity

    const components = storage.getEntityComponents(entity)

    components.forEach(flagDetached)

    ops.push(op)
  }

  function applyOps(opsToApply: WorldOp[]) {
    for (let i = 0; i < opsToApply.length; i++) {
      const op = opsToApply[i]

      if (op[0] === WorldOpType.Detach) {
        const [, entity, componentTypeIds] = op
        const components = storage.getEntityComponents(entity)

        for (let j = 0; j < components.length; j++) {
          const component = components[j]

          if (componentTypeIds.includes(component.type)) {
            flagDetached(component)
          }
        }
      } else if (op[0] === WorldOpType.Destroy) {
        const [, entity] = op
        const components = storage.getEntityComponents(entity)

        components.forEach(flagDetached)
      }

      applyOp(op)
    }
  }

  function getComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> {
    return storage.findComponent(entity, componentType)
  }

  function tryGetComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> | null {
    try {
      return getComponent(entity, componentType)
    } catch {
      return null
    }
  }

  function registerComponentType(
    componentType: ComponentType,
    poolSize = componentPoolSize,
  ) {
    if (componentTypes.includes(componentType)) {
      throw new Error(
        `Tried to register componentType with type id ${componentType.type} more than once.`,
      )
    }

    componentTypes.push(componentType)
    componentPoolsByComponentTypeId.set(
      componentType.type,
      createComponentPool(componentType, poolSize),
    )
  }

  const {
    getObservedComponent,
    isComponentChanged,
    applyComponentPatch,
  } = storage

  const world = {
    [$worldStorageKey]: storage,
    addSystem,
    applyComponentPatch,
    applyOps,
    attach,
    attached,
    component,
    componentTypes,
    destroy,
    detach,
    getComponent,
    getObservedComponent,
    isComponentChanged,
    ops: previousOps,
    registerComponentType,
    spawn,
    tick,
    tryGetComponent,
  }

  return world
}
