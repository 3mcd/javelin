import { createEntityMap } from "./entity_map"

describe("createEntityMap", () => {
  it("initializes values for previously unaccessed entities", () => {
    const entity = 0
    const entityMap = createEntityMap<number[]>(() => [])

    entityMap[entity].push(1)

    expect(entityMap[entity][0]).toEqual(1)
  })

  describe("reset()", () => {
    it("resets entity values using initializer", () => {
      const entity = 0
      const entityMap = createEntityMap<number[]>((entity, data) => {
        if (data) {
          data.length = 0
          return data
        }

        return []
      })
      const entityData = entityMap[entity]

      entityData.push(1)
      entityMap.reset()

      expect(entityMap[entity]).toBe(entityData)
      expect(entityMap[entity]).toEqual([])
    })
  })

  describe("clear()", () => {
    it("clears all values", () => {
      const entity = 0
      const entityMap = createEntityMap<number[]>(() => [])
      const entityData = entityMap[entity]

      entityMap.clear()

      expect(entityMap[entity]).not.toBe(entityData)
    })
  })
})
