import {
  arrayOf,
  boolean,
  createModel,
  createSchemaInstance,
  mapOf,
  number,
  objectOf,
  setOf,
  string,
  resetSchemaInstance,
} from "./model_helpers"
import {
  $kind,
  CollatedNode,
  CollatedNodeSchema,
  Field,
  FieldMap,
  FieldArray,
  FieldKind,
  FieldObject,
  Schema,
  FieldSet,
  $flat,
  FieldExtract,
} from "./model"

const A = {
  x: number,
  y: number,
}
const B = {
  array: arrayOf({
    map: mapOf(string, setOf(string)),
  }),
  object: objectOf(boolean),
}
const modelConfig = new Map<number, Schema>([
  [0, A],
  [1, B],
])
const model = createModel(modelConfig)

describe("model_helpers", () => {
  it("collates", () => {
    // Model
    // A
    expect(model[0].id).toBe(0)
    const a = model[0] as unknown as CollatedNodeSchema
    const [x, y] = a.fields
    expect(a.keys).toEqual(["x", "y"])
    expect(a.fieldsByKey["x"]).toBe(a.fields[0])
    expect(a.fieldsByKey["y"]).toBe(a.fields[1])
    expect(a.fieldIdsByKey["x"]).toBe(1)
    expect(a.fieldIdsByKey["y"]).toBe(2)
    expect(x.id).toBe(1)
    expect(y.id).toBe(2)
    expect((x as Field)[$kind]).toBe(FieldKind.Number)
    expect((y as Field)[$kind]).toBe(FieldKind.Number)
    // B
    expect(model[1].id).toBe(0)
    const b = model[1] as unknown as CollatedNodeSchema
    const [array, object] = b.fields
    expect(b.keys).toEqual(["array", "object"])
    expect((array as Field)[$kind]).toBe(FieldKind.Array)
    expect((object as Field)[$kind]).toBe(FieldKind.Object)
    expect(array.id).toBe(1)
    expect(object.id).toBe(6)
    const elArray = (array as FieldArray<unknown>).element as CollatedNode
    const elObject = (object as FieldObject<unknown>).element as CollatedNode
    expect(elArray.id).toBe(2)
    expect("keys" in elArray).toBe(true)
    const [map] = (elArray as CollatedNodeSchema).fields
    expect(map.id).toBe(3)
    expect((map as Field)[$kind]).toBe(FieldKind.Map)
    const { key: keyMap, element: elMap } = map as FieldMap<string, unknown>
    expect((elMap as CollatedNode).id).toBe(4)
    expect((elMap as Field)[$kind]).toBe(FieldKind.Set)
    const elSet = (elMap as FieldSet<unknown>).element as CollatedNode
    expect(elSet.id).toBe(5)
    expect((elSet as Field)[$kind]).toBe(FieldKind.String)
    expect(keyMap[$kind]).toBe(FieldKind.String)
    expect(elObject.id).toBe(7)
    // Flat
    const flat = model[$flat]
    // A
    expect(flat[0][0]).toBe(a)
    expect(flat[0][1]).toBe(x)
    expect(flat[0][2]).toBe(y)
    // B
    expect(flat[1][0]).toBe(b)
    expect(flat[1][1]).toBe(array)
    expect(flat[1][2]).toBe(elArray)
    expect(flat[1][3]).toBe((elArray as CollatedNodeSchema).fields[0])
    expect(flat[1][4]).toBe(elMap)
    expect(flat[1][5]).toBe(elSet)
    expect(flat[1][6]).toBe(object)
    expect(flat[1][7]).toBe(elObject)
  })
  it("initializes objects from schema", () => {
    const a = createSchemaInstance({} as FieldExtract<typeof A>, A)
    const b = createSchemaInstance({} as FieldExtract<typeof B>, B)
    expect(a.x).toBe(0)
    expect(a.y).toBe(0)
    expect(b.array).toEqual([])
    expect(b.object).toEqual({})
  })
  it("resets objects from schema", () => {
    const a = createSchemaInstance({} as FieldExtract<typeof A>, A)
    const b = createSchemaInstance({} as FieldExtract<typeof B>, B)
    a.x = 98
    a.y = 99
    b.array.push({ map: new Map() })
    b.object.zonk = true
    b.object.zoot = false
    resetSchemaInstance(a, A)
    resetSchemaInstance(b, B)
    expect(a.x).toBe(0)
    expect(a.y).toBe(0)
    expect(b.array).toEqual([])
    expect(b.object).toEqual({})
  })
})
