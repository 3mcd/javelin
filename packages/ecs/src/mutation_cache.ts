type PropertyKey = number | string

export type Path = string
export type ProxyTarget =
  | Function
  | {
      [key: string]: unknown
      [key: number]: unknown
    }
  | unknown[]

export interface MutationCache {
  proxy<T extends ProxyTarget>(root: T): T
  revoke(root: ProxyTarget): void
}

const rMethod = /^\d+\(\)$/
const rInteger = /\d+/

let splitPathCache: { [path: string]: Array<string | number> } = {}

function splitPath(path: Path): ReadonlyArray<string | number> {
  let splitPath = splitPathCache[path]

  if (!splitPath) {
    splitPath = path.split(".")

    for (let i = 0; i < splitPath.length; i++) {
      const pathComponent = splitPath[i]

      if (rInteger.test(pathComponent as string)) {
        splitPath[i] = Number(pathComponent)
      }
    }

    splitPathCache[path] = splitPath
  }

  return splitPath
}

export function applyMutation(root: ProxyTarget, path: Path, value: unknown) {
  const arrPath = splitPath(path)
  const key = arrPath[arrPath.length - 1]

  let target = root

  for (let i = 0; i < arrPath.length - 1; i++) {
    // @ts-ignore
    target = target[arrPath[i]] as ProxyTarget
  }

  const methodMatches = typeof key === "string" && key.match(rMethod)
  const methodType = methodMatches ? Number(methodMatches[0]) : null

  if (typeof methodType === "number") {
    // @ts-ignore
    mutArrayMethodsByType
      .get(methodType)
      ?.apply(arrPath[arrPath.length - 2], value)
  }

  // @ts-ignore
  target[key] = value
}

const isValidProxyTarget = (obj: unknown): obj is ProxyTarget =>
  (typeof obj === "object" && obj !== null) || typeof obj === "function"

type MutationCacheOptions = {
  onChange(
    root: ProxyTarget,
    target: ProxyTarget,
    path: Path,
    value: unknown,
    mutArrayMethodType?: MutArrayMethodType,
  ): void
}

export enum MutArrayMethodType {
  Push,
  Pop,
  Shift,
  Unshift,
  Splice,
}

export const MUT_ARRAY_METHODS: ReadonlyMap<
  Function,
  MutArrayMethodType
> = new Map<Function, MutArrayMethodType>([
  [Array.prototype.push, MutArrayMethodType.Push],
  [Array.prototype.pop, MutArrayMethodType.Pop],
  [Array.prototype.shift, MutArrayMethodType.Shift],
  [Array.prototype.unshift, MutArrayMethodType.Unshift],
  [Array.prototype.splice, MutArrayMethodType.Splice],
])
export const mutArrayMethodsByType = new Map<MutArrayMethodType, Function>([
  [MutArrayMethodType.Push, Array.prototype.push],
  [MutArrayMethodType.Pop, Array.prototype.pop],
  [MutArrayMethodType.Shift, Array.prototype.shift],
  [MutArrayMethodType.Unshift, Array.prototype.unshift],
  [MutArrayMethodType.Splice, Array.prototype.splice],
])

const ROOT_PATH = ""

export const createMutationCache = ({
  onChange,
}: MutationCacheOptions): MutationCache => {
  const targetRoots = new WeakMap<ProxyTarget, ProxyTarget>()
  const targetPaths = new WeakMap<ProxyTarget, string>()
  const targetProxies = new WeakMap<ProxyTarget, ProxyTarget>()
  const proxyTargetLookup = new WeakMap<ProxyTarget, ProxyTarget>()
  const locked = new WeakSet<ProxyTarget>()

  function getPath(target: ProxyTarget, key: PropertyKey) {
    const basePath = targetPaths.get(target)

    if (basePath === ROOT_PATH) {
      return key.toString()
    }

    return `${basePath}.${key}`
  }

  function getProxy(
    target: ProxyTarget,
    root: ProxyTarget = target,
    path: Path = ROOT_PATH,
  ): ProxyTarget {
    let proxy = targetProxies.get(target)

    if (proxy === undefined) {
      proxy = new Proxy(target, handler)
      targetProxies.set(target, proxy)
      proxyTargetLookup.set(proxy, target)
      targetRoots.set(target, root)
      targetPaths.set(target, path)
    }

    return proxy
  }

  const handler = {
    get(target: ProxyTarget, propertyKey: PropertyKey, receiver: ProxyTarget) {
      const value = Reflect.get(target, propertyKey, receiver)

      if (typeof propertyKey !== "symbol" && isValidProxyTarget(value)) {
        return getProxy(
          value,
          targetRoots.get(target),
          getPath(target, propertyKey),
        )
      }

      return value
    },
    set(
      target: ProxyTarget,
      propertyKey: PropertyKey,
      value: unknown,
      receiver: ProxyTarget,
    ) {
      const previous = (target as any)[propertyKey]

      ;(target as any)[propertyKey] = value

      if (previous !== value && !locked.has(target)) {
        onChange(
          targetRoots.get(target)!,
          target,
          getPath(target, propertyKey),
          value,
        )
      }

      return true
    },
    apply(
      target: Function,
      thisArgument: ProxyTarget,
      argumentsList: unknown[],
    ) {
      const isArray = Array.isArray(thisArgument)
      const targetProxy = proxyTargetLookup.get(thisArgument)!

      let mutArrayMethodType = MUT_ARRAY_METHODS.get(target)
      let hasMutArrayMethodType =
        isArray && typeof mutArrayMethodType === "number"

      if (hasMutArrayMethodType) {
        locked.add(targetProxy)
      }

      const result = Reflect.apply(target, thisArgument, argumentsList)

      if (hasMutArrayMethodType) {
        onChange(
          targetRoots.get(targetProxy)!,
          thisArgument,
          getPath(targetProxy, `${mutArrayMethodType}()`),
          argumentsList,
        )

        locked.delete(thisArgument)
      }

      return result
    },
  }

  function revoke(target: ProxyTarget) {
    const proxy = targetProxies.get(target)!
    targetProxies.delete(target)
    proxyTargetLookup.delete(proxy)
  }

  function proxy<T extends ProxyTarget>(target: T): T {
    return getProxy(target) as T
  }

  return {
    proxy,
    revoke,
  }
}
