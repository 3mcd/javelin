import * as j from "@javelin/ecs"
import {expect} from "@javelin/lib"
import {stepServerWorldSystem} from "./client.js"
import {ServerTime, ServerWorld} from "./client_resources.js"
import {NormalizedModel} from "./model.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

type PredictionStatus =
  | "initial"
  | "synced"
  | "awaiting_snapshot"
  | "blending"
  | "fast_forwarding"
  | "fast_forwarding_overshot"
  | "fast_forwarding_obsolete"

export let Snapshots = j.resource<Uint8Array[]>()
export let LatestSnapshotTime = j.resource<number>()
export let PredictionStatus = j.resource<PredictionStatus>()
export let PredictionCommands = j.resource<TimestampBuffer<unknown>>()
export let ServerWorldCommands = j.resource<TimestampBuffer<unknown>>()
export let CorrectedWorld = j.resource<j.World>()
export let CorrectedWorldCommands = j.resource<TimestampBuffer<unknown>>()

export let forwardCommandsToCorrectedWorldSystem = (world: j.World) => {
  let model = world.getResource(NormalizedModel)
  let commands = world.getResource(j.Commands)
  let serverWorld = world.getResource(ServerWorld)
  let correctedWorld = world.getResource(CorrectedWorld)
  for (let i = 0; i < model.commandTypes.length; i++) {
    let commandType = model.commandTypes[i]
    let commandQueue = commands.of(commandType)
    if (commandQueue.length > 0) {
      for (let i = 0; i < commandQueue.length; i++) {
        let command = commandQueue[i]
        // serverWorld.getResource(j.Commands).dispatch(commandType, command)
        // correctedWorld.getResource(j.Commands).dispatch(commandType, command)
      }
    }
  }
}

let updatePredictionStatusSystem = (world: j.World) => {
  if (world.hasResource(ServerTime)) {
    world.setResource(PredictionStatus, "synced")
  }
}

let applySnapshotsSystem = () => {}

let fastForwardCorrectedWorldSystem = () => {}

export let clientPredictionPlugin = (app: j.App) => {
  let serverWorld = expect(app.getResource(ServerWorld))
  let correctedWorld = new j.World()
  serverWorld.setResource(CorrectedWorld, correctedWorld)
  app
    .addResource(Snapshots, [])
    .addResource(LatestSnapshotTime, -1)
    .addResource(PredictionStatus, "initial")
    .addResource(PredictionCommands, new TimestampBuffer())
    .addResource(ServerWorldCommands, new TimestampBuffer())
    .addResource(CorrectedWorld, correctedWorld)
    .addResource(CorrectedWorldCommands, new TimestampBuffer())
    .addSystemToGroup(
      j.Group.LateUpdate,
      forwardCommandsToCorrectedWorldSystem,
      j.after(stepServerWorldSystem),
    )
    .addSystem(
      updatePredictionStatusSystem,
      null,
      world => world.getResource(PredictionStatus) === "initial",
    )
}
