import {
  arrayOf,
  createModel,
  DataTypeArray,
  DataTypeNumber,
  isDataType,
  ModelNodeField,
  ModelNodeStruct,
  ModelConfig,
  ModelNodeKind,
  number,
  patch,
  Schema,
  string,
} from "./model"

function assertIsModelNodeStruct(
  object: any,
): asserts object is ModelNodeStruct {
  if (isDataType(object)) {
    throw new Error("Object is not ModelNodeStruct")
  }
}

describe("model", () => {
  let model: ModelConfig
  beforeEach(() => {
    model = new Map<number, Schema>([
      [
        0,
        {
          x: number,
          y: number,
          buffer: arrayOf(number),
        },
      ],
      [
        1,
        {
          inventory: arrayOf({
            name: string,
            stats: {
              damage: number,
              speed: number,
            },
          }),
        },
      ],
    ])
  })
  it("collates", () => {
    const collated = createModel(model)
    const { [0]: a, [1]: b } = collated

    assertIsModelNodeStruct(a)
    expect(a.id).toBe(0)
    const [buffer, x, y] = a.edges
    expect(buffer.id).toBe(1)
    expect(
      (buffer as ModelNodeField).type as DataTypeArray<typeof number>,
    ).toBe(number)
    expect(x.id).toBe(2)
    expect((x as ModelNodeField).type as DataTypeNumber).toBe(number)
    expect(y.id).toBe(3)
    expect((y as ModelNodeField).type as DataTypeNumber).toBe(number)

    assertIsModelNodeStruct(b)
    expect(b.id).toBe(0)
    const [inventory] = b.edges
    assertIsModelNodeStruct(inventory)
    expect(inventory.id).toBe(1)
    expect(inventory.kind).toBe(ModelNodeKind.Array)
    const [name, stats] = inventory.edges
    expect(name.id).toBe(2)
    expect((name as ModelNodeField).type).toBe(string)
    expect(stats.id).toBe(3)
    assertIsModelNodeStruct(stats)
    const [damage, speed] = stats.edges
    expect(damage.id).toBe(4)
    expect((damage as ModelNodeField).type).toBe(number)
    expect(speed.id).toBe(5)
    expect((speed as ModelNodeField).type).toBe(number)
  })
  it("patches", () => {
    const collated = createModel(model)
    const instance = {
      inventory: [
        { name: "straw", stats: { damage: 1, speed: 1 } },
        { name: "sword", stats: { damage: 10, speed: 3 } },
      ],
    }
    patch(collated, 1, 2, instance, [0], (object, key) => {
      object[key] = "noodle"
    })
    patch(collated, 1, 5, instance, [1], (object, key) => {
      object[key] = 6
    })
    expect(instance.inventory[0].name).toBe("noodle")
    expect(instance.inventory[1].stats.speed).toBe(6)
  })
})
