import { createMutationCache, MutArrayMethodType } from "./mutation_cache"

type MutationData = [unknown, unknown, string, unknown]

describe("createMutationCache", () => {
  it("tracks changes on both shallow and deeply nested values", () => {
    const mutations: MutationData[] = []
    const mutationCache = createMutationCache({
      onChange(root, target, path, value) {
        mutations.push([root, target, path, value])
      },
    })
    const root = {
      a: {
        b: [{ c: 1 }],
      },
    }
    const mRoot = mutationCache.proxy(root)
    const toPush = { c: 3 }

    mRoot.a.b[0].c = 2
    mRoot.a.b.push(toPush)
    mRoot.a.b[1].c = 4
    mRoot.a.b.pop()

    expect(mutations.length).toBe(4)
    expect(mutations[0][0]).toBe(root)
    expect(mutations[0][2]).toBe("a.b.0.c")
    expect(mutations[0][3]).toBe(2)

    expect(mutations[1][0]).toBe(root)
    expect(mutations[1][2]).toBe(`a.b.${MutArrayMethodType.Push}()`)
    expect(mutations[1][3]).toEqual([toPush])

    expect(mutations[2][0]).toBe(root)
    expect(mutations[2][2]).toBe("a.b.1.c")
    expect(mutations[2][3]).toBe(4)

    expect(mutations[3][0]).toBe(root)
    expect(mutations[3][2]).toBe(`a.b.${MutArrayMethodType.Pop}()`)
    expect(mutations[3][3]).toEqual([])
  })

  it("emits special mutations for mutating array methods", () => {
    const mutations: MutationData[] = []
    const mutationCache = createMutationCache({
      onChange(root, target, path, value) {
        mutations.push([root, target, path, value])
      },
    })
    const root = { nums: [1, 2, 3] }
    const mRoot = mutationCache.proxy(root)

    mRoot.nums.unshift(0)

    expect(mutations.length).toBe(1)
    expect(mutations[0][2]).toBe(`nums.${MutArrayMethodType.Unshift}()`)
    expect(mutations[0][3]).toEqual([0])
  })
})
