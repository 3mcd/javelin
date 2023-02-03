import * as j from "@javelin/ecs"
import {FixedTime} from "@javelin/ecs"
import {ServerWorld} from "./client_resources.js"
import {ServerWorldCorrected} from "./client_prediction.js"
import {
  Interest,
  InterestImpl,
  interestMessage,
  InterestState,
  InterestStateImpl,
  SubjectPrioritizer,
} from "./interest.js"
import {makeMessage} from "./protocol.js"

export let snapshotInterestMessage = makeMessage(
  (stream, world: j.World, message: InterestState) => {
    world = world.getResource(ServerWorld)
    // stream.grow(4)
    // stream.writeF64(world.getResource(FixedTime).currentTime)
    // interestMessageType.encode(stream, world, message)
  },
  (stream, world: j.World) => {
    world = world.getResource(ServerWorld)
    // interestMessageType.decode(stream, world, length)
    // let serverTime = stream.readF64()
    // // 0. discard shared commands older than snapshot timestamp
    // // 1. copy CorrectedWorld to ServerWorld
    // // 2. apply snapshot to CorrectedWorld
    // // 3. step ServerWorld as usual
    // // 4. start fast-forwarding CorrectedWorld in a performant way towards the latest ServerWorld step as to not block the main thread
    // // 5. when CorrectedWorld is caught up, start blending ServerWorld towards CorrectedWorld (this might happen in userland)
    // // 6. once blending is complete, await next snapshot (can we stop stepping CorrectedWorld at this time??)
    // // let serverWorldCorrected = world.getResource(ServerWorldCorrected)
    // // interestMessageType.decode(
    // //   stream,
    // //   serverWorldCorrected,
    // //   entity,
    // //   length,
    // // )
  },
)

interface SnapshotInterestState extends InterestState {
  readonly sendRate: number
  readonly lastSendTime: number
}

export class SnapshotInterestStateImpl
  extends InterestStateImpl
  implements SnapshotInterestState {}

export class SnapshotInterestImpl extends InterestImpl {
  init() {
    return new SnapshotInterestStateImpl(
      this.subjectType,
      this.subjectPrioritizer,
      this.sendRate,
    )
  }
}

export let makeSnapshotInterest = (
  subjectType: j.Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
): Interest => new SnapshotInterestImpl(subjectType, subjectPrioritizer, 1 / 20)
