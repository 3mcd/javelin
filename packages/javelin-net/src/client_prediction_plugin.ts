import * as j from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {ServerWorld, stepServerWorldSystem} from "./client_plugin.js"
import {NormalizedNetworkModel} from "./network_model.js"

export let ServerWorldCorrected = j.resource<j.World>()

let forwardCommandsToCorrectedWorldSystem = (world: j.World) => {
  let serverWorld = world.getResource(ServerWorld)
  let serverWorldCorrected = world.getResource(ServerWorldCorrected)
  let networkModel = serverWorld.getResource(NormalizedNetworkModel)
  for (let i = 0; i < networkModel.commandTypes.length; i++) {
    let commandType = networkModel.commandTypes[i]
    let commandQueue = serverWorld.commands(commandType)
    if (commandQueue.length > 0) {
      for (let i = 0; i < commandQueue.length; i++) {
        let command = commandQueue[i]
        serverWorldCorrected.dispatch(commandType, command)
      }
    }
  }
}

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
