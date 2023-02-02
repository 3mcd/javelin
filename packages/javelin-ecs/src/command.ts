import {exists} from "@javelin/lib"
import {Schema} from "./schema.js"
import {makeValueType, Singleton} from "./type.js"

export type Command<T = unknown> = Singleton<T>

let commands: Command[] = []

export let makeCommand = <T extends Schema>(schema: T): Singleton<T> => {
  let commandType = makeValueType(schema)
  let commandComponent = commandType.components[0]
  commands[commandComponent] = commandType
  return commandType
}

export let isCommand = (commandType: Singleton): boolean => {
  let commandComponent = commandType.components[0]
  return exists(commands[commandComponent])
}
