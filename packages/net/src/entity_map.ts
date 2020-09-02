import { mutableEmpty } from "@javelin/ecs"

type ForEach<T> = (callback: (entity: number, value: T) => void) => void

interface EntityMap<T> {
  [entity: number]: T
  reset(): void
  clear(): void
  forEach: ForEach<T>
}

const rInt = /^\d+$/

export function createEntityMap<T extends object>(
  init: (entity: number, value: T | undefined) => T,
  track: boolean = true,
): EntityMap<T> {
  const touched = new Set<string>()
  const map: (T | undefined)[] = []
  const reset = () => {
    touched.clear()

    for (let i = 0; i < map.length; i++) {
      const value = map[i]

      if (value !== undefined) {
        const nextValue = (init as any)(i, map[i])
        map[i] = nextValue
      }
    }
  }
  const clear = () => {
    touched.clear()
    mutableEmpty(map)
  }
  const handler: ProxyHandler<EntityMap<T>> = track
    ? {
        get(target, propertyKey: any) {
          if (typeof propertyKey === "string" && rInt.test(propertyKey)) {
            let value = map[propertyKey as any]

            if (value === undefined) {
              value = map[propertyKey as any] = init(propertyKey as any, value)
            }

            touched.add(propertyKey)

            return value
          }

          return target[propertyKey]
        },
      }
    : {
        get(target, propertyKey: any) {
          if (typeof propertyKey === "string" && rInt.test(propertyKey)) {
            let value = map[propertyKey as any]

            if (value === undefined) {
              value = map[propertyKey as any] = init(propertyKey as any, value)
            }

            return value
          }

          return target[propertyKey]
        },
      }

  const forEach: ForEach<T> = track
    ? callback => {
        for (const entity of touched) {
          callback(+entity, map[entity as any]!)
        }
      }
    : callback => {
        for (let i = 0; i < map.length; i++) {
          const value = map[i]

          if (value !== undefined) {
            callback(i, value)
          }
        }
      }

  return new Proxy({ reset, clear, forEach }, handler) as EntityMap<T>
}
