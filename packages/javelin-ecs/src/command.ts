import {exists, expect} from "@javelin/lib"
import {App, _systemGroups} from "./app.js"
import {Value} from "./component.js"
import {makeResource} from "./resource.js"
import {Struct} from "./schema.js"
import {makeValueType, Singleton} from "./type.js"
import {CurrentSystemGroup} from "./world.js"

export type Command<T = unknown> = Singleton<T>

let commands: Command[] = []

export let makeCommand = <T extends Struct>(schema: T): Singleton<T> => {
  let commandType = makeValueType(schema)
  let commandComponent = commandType.components[0]
  commands[commandComponent] = commandType
  return commandType
}

export let isCommand = (commandType: Singleton): boolean => {
  let commandComponent = commandType.components[0]
  return exists(commands[commandComponent])
}

export type CommandsOfIteratee<T> = (command: Value<T>) => void

export type Commands = {
  dispatch(commandType: Singleton, command: unknown): void
  of<T>(commandType: Singleton<T>, callback: CommandsOfIteratee<T>): void
}

export let Commands = makeResource<Commands>()

export let commandPlugin = (app: App) => {
  let commands = {
    dispatch(commandType: Singleton, command: unknown) {
      let systemGroups = app[_systemGroups]
      for (let i = 0; i < systemGroups.length; i++) {
        systemGroups[i].pushCommand(commandType, command)
      }
    },
    of<T>(commandType: Singleton<T>, iteratee: CommandsOfIteratee<T>) {
      let systemGroup = app.getResource(CurrentSystemGroup)
      let commandQueue = expect(systemGroup).getCommandQueue(commandType)
      for (let i = 0; i < commandQueue.length; i++) {
        iteratee(commandQueue[i])
      }
    },
  }
  app.addResource(Commands, commands)
}
