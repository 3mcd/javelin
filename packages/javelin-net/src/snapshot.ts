import * as j from "@javelin/ecs"
import {
  Interest,
  InterestImpl,
  interestMessage,
  InterestState,
  InterestStateImpl,
  SubjectPrioritizer,
} from "./interest.js"
import {makeMessage} from "./protocol.js"
import {LatestSnapshotTime, Snapshots} from "./client_prediction.js"

export let snapshotInterestMessage = makeMessage({
  encode(stream, world: j.World, interest: InterestState) {
    // stream.grow(4)
    // stream.writeF64(world.getResource(j.Time).currentTime)
    // interestMessage.encode(stream, world, interest)
  },
  decode(stream, world: j.World, _, length) {
    // let snapshots = world.getResource(Snapshots)
    // let snapshotTime = stream.readF64()
    // let latestSnapshotTime = world.getResource(LatestSnapshotTime)
    // if (snapshotTime > latestSnapshotTime) {
    //   world.setResource(LatestSnapshotTime, snapshotTime)
    // }
    // snapshots.push(stream.bytes(length))
  },
})

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
