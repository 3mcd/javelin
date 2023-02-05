import * as j from "@javelin/ecs"
import {World} from "@javelin/ecs"
import {expect, SparseSet} from "@javelin/lib"
import {stepServerWorldSystem} from "./client.js"
import {
  LatestSnapshotTimestamp,
  Snapshots,
} from "./client_prediction_resources.js"
import {ServerTime, ServerWorld} from "./client_resources.js"
import {interestMessage} from "./interest.js"
import {makeTimestamp, Timestamp} from "./timestamp.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

type PredictionStatus =
  | "initial"
  | "synced"
  | "awaiting_snapshot"
  | "blending"
  | "fast_forwarding"
  | "fast_forwarding_overshot"
  | "fast_forwarding_obsolete"

export let PredictionStatus = j.resource<PredictionStatus>()
export let PredictionCommands = j.resource<TimestampBuffer<unknown>>()
export let PredictionBlendProgress = j.resource<number>()
export let ServerWorldCommands = j.resource<TimestampBuffer<unknown>>()
export let CorrectedWorld = j.resource<j.World>()
export let CorrectedWorldCommands = j.resource<TimestampBuffer<unknown>>()

export let forwardCommandsToCorrectedWorldSystem = (world: j.World) => {
  // let model = world.getResource(NormalizedModel)
  // let commands = world.getResource(j.Commands)
  // let serverWorld = world.getResource(ServerWorld)
  // let correctedWorld = world.getResource(CorrectedWorld)
  // for (let i = 0; i < model.commandTypes.length; i++) {
  //   let commandType = model.commandTypes[i]
  //   let commandQueue = commands.of(commandType)
  //   if (commandQueue.length > 0) {
  //     for (let i = 0; i < commandQueue.length; i++) {
  //       let command = commandQueue[i]
  //       // serverWorld.getResource(j.Commands).dispatch(commandType, command)
  //       // correctedWorld.getResource(j.Commands).dispatch(commandType, command)
  //     }
  //   }
  // }
}

let updatePredictionStatusSystem = (world: j.World) => {
  let status = world.getResource(PredictionStatus)
  if (status === "initial" && world.hasResource(ServerTime)) {
    world.setResource(PredictionStatus, "synced")
  }
  if (status === "awaiting_snapshot") {
    if (world.hasResource(LatestSnapshotTimestamp)) {
      world.setResource(PredictionStatus, "fast_forwarding")
    }
  }
}

let initWorldsSystem = (world: j.World) => {
  world.setResource(PredictionStatus, "awaiting_snapshot")
}

let applySnapshotsSystem = (world: World) => {
  let snapshotsByInterest = world.getResource(Snapshots)
  let snapshotQueues = snapshotsByInterest.values()
  for (let i = 0; i < snapshotQueues.length; i++) {
    let snapshots = snapshotQueues[i]
    if (snapshots.length > 0) {
      let snapshotTimestamp: Timestamp
      snapshots.drainAll((snapshot, timestamp) => {
        snapshotTimestamp = timestamp
        interestMessage.decode(snapshot, world, 0 as j.Entity, 0)
      })
      // world.setResource(LatestSnapshotTimestamp, snapshotTimestamp!)
    }
  }
}

let fastForwardCorrectedWorldSystem = () => {}

export let clientPredictionPlugin = (app: j.App) => {
  let serverWorld = expect(app.getResource(ServerWorld))
  let correctedWorld = new j.World()
  serverWorld.setResource(CorrectedWorld, correctedWorld)
  app
    .addResource(Snapshots, new SparseSet())
    .addResource(PredictionStatus, "initial")
    .addResource(PredictionCommands, new TimestampBuffer())
    .addResource(PredictionBlendProgress, 0)
    .addResource(ServerWorldCommands, new TimestampBuffer())
    .addResource(CorrectedWorld, correctedWorld)
    .addResource(CorrectedWorldCommands, new TimestampBuffer())
    .addSystemToGroup(
      j.Group.LateUpdate,
      forwardCommandsToCorrectedWorldSystem,
      j.after(stepServerWorldSystem),
    )
    .addSystemToGroup(j.FixedGroup.Early, updatePredictionStatusSystem)
    .addSystemToGroup(
      j.FixedGroup.Early,
      initWorldsSystem,
      j.after(updatePredictionStatusSystem),
      world => world.getResource(PredictionStatus) === "synced",
    )
    .addSystemToGroup(
      j.FixedGroup.Early,
      applySnapshotsSystem,
      j.after(updatePredictionStatusSystem),
      world => world.getResource(PredictionStatus) === "awaiting_snapshot",
    )
    .addSystemToGroup(
      j.FixedGroup.Early,
      fastForwardCorrectedWorldSystem,
      j.after(updatePredictionStatusSystem),
      world => world.getResource(PredictionStatus) === "fast_forwarding",
    )
}
