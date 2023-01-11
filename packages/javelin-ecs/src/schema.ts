/**
 * Component value attribute formats.
 */
export type Format =
  | "u8"
  | "u16"
  | "u32"
  | "i8"
  | "i16"
  | "i32"
  | "f32"
  | "f64"
  | "number"

/**
 * The shape of a component value.
 */
export type Schema = Format | {[key: string]: Format}

/**
 * Derive the schema type of a component value.
 */
export type SchemaOf<T> = T extends number
  ? Format
  : T extends {}
  ? {[K in keyof T]: Format}
  : never

/**
 * Derive the component value type of a schema.
 */
export type Express<T extends Schema> = T extends Format
  ? number
  : {[K in keyof T]: number}
