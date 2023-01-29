# Components

If entities are the bread of ECS then components are the butter. Components provide state to entities that persists between game steps.

You can read about how components are added to entities in the [Entities](./entities.md) chapter.

## Tag Components

Because systems resolve entities based on their composition, the simple addition of a component to an entity has meaning in Javelin. It stands to reason then that systems could execute per-entity logic solely based on the presence of a component.

Tags are the simplest kind of component. They are stateless, and consequentially are performantly added and removed from entities.

Tags are created with the `tag` function:

```ts
let PurpleTeam = j.tag()
let YellowTeam = j.tag()
```

Tags also happen to take up minimal space in network messages because they have no corresponding value to serialize.

## Value Components

Value components define entity state that should be represented with a value, like a string, array, or object. They are created with the `value` function:

```ts
let Mass = j.value()
```

`value` accepts a generic type parameter that defines the value the component represents. Value components that aren't provided a value type are represented as `unknown`.

```ts
let Mass = j.value<number>()
```

### Schema

Value components may optionally be defined with a schema. Schemas are component blueprints that make a component's values eligible for auto-initialization, serialization, pooling, and validation.

A value component can be defined with a schema by providing the schema as the first parameter to `value`:

```ts
let Mass = j.value("f32")
```

Schemas can take the form of scalars or records.

```ts
let Quaternion = j.value({
  x: "f32",
  y: "f32",
  z: "f32",
  w: "f32",
})
```

> Deeply-nested schema are planned, but not supported at the current point in Javelin's development.

Below is a table of all schema-supported formats.

| id     | format                  | supported values                |
| ------ | ----------------------- | ------------------------------- |
| number | (alias of f64)          |                                 |
| u8     | 8-bit unsigned integer  | 0 to 255                        |
| u16    | 16-bit unsigned integer | 0 to 65,535                     |
| u32    | 32-bit unsigned integer | 0 to 4,294,967,295              |
| i8     | 8-bit signed integer    | -128 to 127                     |
| i16    | 16-bit signed integer   | -32,768 to 32,767               |
| i32    | 32-bit signed integer   | -2,147,483,648 to 2,147,483,647 |
| f32    | 32-bit float            |                                 |
| f64    | 64-bit float            |                                 |
