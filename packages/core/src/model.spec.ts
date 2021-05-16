import {
  $struct,
  arrayOf,
  createModel,
  DataTypeNumber,
  ModelConfig,
  ModelNode,
  ModelNodeArray,
  ModelNodePrimitive,
  ModelNodeSchema,
  number,
  Schema,
  SchemaKeyKind,
  string,
} from "./model"

function assertIsModelNodeSchema(
  node: ModelNode,
): asserts node is ModelNodeSchema {
  if (node.kind !== $struct) {
    throw new Error()
  }
}

function assertIsModelNodeArray(
  node: ModelNode,
): asserts node is ModelNodeArray {
  if (node.kind !== SchemaKeyKind.Array) {
    throw new Error()
  }
}

describe("model", () => {
  let config: ModelConfig
  beforeEach(() => {
    config = new Map<number, Schema>([
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
    const model = createModel(config)
    const { [0]: a, [1]: b } = model

    assertIsModelNodeSchema(a)
    expect(a.id).toBe(-1)
    const [buffer, x, y] = a.edges
    expect(buffer.id).toBe(0)
    const { edge } = buffer as ModelNodeArray
    expect((edge as ModelNodePrimitive).id).toBe(1)
    expect((edge as ModelNodePrimitive).type).toBe(number)
    expect(edge.inCollection).toBe(true)
    expect(x.id).toBe(2)
    expect(x.inCollection).toBe(false)
    expect((x as ModelNodePrimitive).type as DataTypeNumber).toBe(number)
    expect(y.id).toBe(3)
    expect((y as ModelNodePrimitive).type as DataTypeNumber).toBe(number)

    assertIsModelNodeSchema(b)
    expect(b.id).toBe(-1)
    const [inventory] = b.edges
    assertIsModelNodeArray(inventory)
    expect(inventory.id).toBe(0)
    expect(inventory.kind).toBe(SchemaKeyKind.Array)
    const item = inventory.edge
    expect(item.id).toBe(1)
    expect(item.inCollection).toBe(true)
    assertIsModelNodeSchema(item)
    const [name, stats] = item.edges
    expect(name.id).toBe(2)
    expect((name as ModelNodePrimitive).type).toBe(string)
    expect(stats.id).toBe(3)
    assertIsModelNodeSchema(stats)
    const [damage, speed] = stats.edges
    expect(damage.id).toBe(4)
    expect((damage as ModelNodePrimitive).type).toBe(number)
    expect(speed.id).toBe(5)
    expect(speed.inCollection).toBe(true)
    expect((speed as ModelNodePrimitive).type).toBe(number)
  })
})
