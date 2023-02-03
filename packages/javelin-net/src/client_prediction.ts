import * as j from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {stepServerWorldSystem} from "./client.js"
import {ServerWorld} from "./client_resources.js"
import {NormalizedModel} from "./model.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

export let PredictionCommands = j.resource<TimestampBuffer<unknown>>()
export let ServerWorldCorrected = j.resource<j.World>()
export let ServerWorldCorrectedCommands = j.resource<TimestampBuffer<unknown>>()
export let ServerSnapshots = j.resource<Uint8Array[]>()
export let ServerWorldCommands = j.resource<TimestampBuffer<unknown>>()

let forwardCommandsToCorrectedWorldSystem = (world: j.World) => {
  let serverWorld = world.getResource(ServerWorld)
  let serverWorldCorrected = world.getResource(ServerWorldCorrected)
  let model = world.getResource(NormalizedModel)
  for (let i = 0; i < model.commandTypes.length; i++) {
    let commandType = model.commandTypes[i]
    let commandQueue = serverWorld.commands(commandType)
    if (commandQueue.length > 0) {
      for (let i = 0; i < commandQueue.length; i++) {
        let command = commandQueue[i]
        serverWorldCorrected.dispatch(commandType, command)
      }
    }
  }
}

let applySnapshotsSystem = () => {}

let fastForwardCorrectedWorldSystem = () => {}

export let clientPredictionPlugin = (app: j.App) => {
  let serverWorld = expect(app.getResource(ServerWorld))
  let serverWorldCorrected = new j.World()
  serverWorld.setResource(ServerWorldCorrected, serverWorldCorrected)
  app
    .addResource(ServerWorldCorrected, serverWorldCorrected)
    .addSystemToGroup(
      j.Group.LateUpdate,
      forwardCommandsToCorrectedWorldSystem,
      j.after(stepServerWorldSystem),
    )
}
