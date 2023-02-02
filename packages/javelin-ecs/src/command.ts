import {exists} from "@javelin/lib"
import {Schema} from "./schema.js"
import {makeValueType, Singleton} from "./type.js"

export type Command<T = unknown> = Singleton<T>

let commands: Command[] = []

export let makeCommand = (schema: Schema) => {
  let commandType = makeValueType(schema)
  commands[commandType.components[0]] = commandType
  return commandType
}

export let isCommand = (type: Singleton): boolean =>
  exists(commands[type.components[0]])
