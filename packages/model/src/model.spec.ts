import {
  arrayOf,
  createModel,
  DataTypeNumber,
  ModelConfig,
  ModelNode,
  ModelNodeArray,
  ModelNodeKind,
  ModelNodePrimitive,
  ModelNodeStruct,
  number,
  Schema,
  string,
} from "./model"

function assertIsModelNodeStruct(
  node: ModelNode,
): asserts node is ModelNodeStruct {
  if (node.kind !== ModelNodeKind.Struct) {
    throw new Error()
  }
}

function assertIsModelNodeArray(
  node: ModelNode,
): asserts node is ModelNodeArray {
  if (node.kind !== ModelNodeKind.Array) {
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

    assertIsModelNodeStruct(a)
    expect(a.id).toBe(0)
    const [buffer, x, y] = a.edges
    expect(buffer.id).toBe(1)
    const { edge } = buffer as ModelNodeArray
    expect((edge as ModelNodePrimitive).id).toBe(2)
    expect((edge as ModelNodePrimitive).type).toBe(number)
    expect(edge.inCollection).toBe(true)
    expect(x.id).toBe(3)
    expect(x.inCollection).toBe(false)
    expect((x as ModelNodePrimitive).type as DataTypeNumber).toBe(number)
    expect(y.id).toBe(4)
    expect((y as ModelNodePrimitive).type as DataTypeNumber).toBe(number)

    assertIsModelNodeStruct(b)
    expect(b.id).toBe(0)
    const [inventory] = b.edges
    assertIsModelNodeArray(inventory)
    expect(inventory.id).toBe(1)
    expect(inventory.kind).toBe(ModelNodeKind.Array)
    const item = inventory.edge
    expect(item.id).toBe(2)
    expect(item.inCollection).toBe(true)
    assertIsModelNodeStruct(item)
    const [name, stats] = item.edges
    expect(name.id).toBe(3)
    expect((name as ModelNodePrimitive).type).toBe(string)
    expect(stats.id).toBe(4)
    assertIsModelNodeStruct(stats)
    const [damage, speed] = stats.edges
    expect(damage.id).toBe(5)
    expect((damage as ModelNodePrimitive).type).toBe(number)
    expect(speed.id).toBe(6)
    expect(speed.inCollection).toBe(true)
    expect((speed as ModelNodePrimitive).type).toBe(number)
  })
})
