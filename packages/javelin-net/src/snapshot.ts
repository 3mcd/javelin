import * as j from "@javelin/ecs"
import {exists} from "@javelin/lib"
import {Snapshots} from "./client_prediction_resources.js"
import {
  Interest,
  InterestImpl,
  interestMessage,
  InterestState,
  InterestStateImpl,
  SubjectPrioritizer,
} from "./interest.js"
import {makeMessage} from "./protocol.js"
import {makeTimestampFromTime} from "./timestamp.js"
import {TimestampBuffer} from "./timestamp_buffer.js"

let snapshotInterestIds = 0

export let snapshotMessage = makeMessage({
  encode(stream, world: j.World, interest: SnapshotInterestState) {
    stream.grow(10)
    stream.writeU16(interest.id)
    stream.writeF64(world.getResource(j.Time).currentTime)
    interestMessage.encode(stream, world, interest)
  },
  decode(stream, world: j.World, _, length) {
    let snapshotsByInterest = world.getResource(Snapshots)
    let snapshotId = stream.readU16()
    let snapshots = snapshotsByInterest.get(snapshotId)
    if (!exists(snapshots)) {
      snapshots = new TimestampBuffer()
      snapshotsByInterest.set(snapshotId, snapshots)
    }
    let snapshotTime = stream.readF64()
    snapshots.insert(
      stream.into(length),
      makeTimestampFromTime(snapshotTime, 1 / 60),
    )
  },
})

export interface SnapshotInterestState extends InterestState {
  readonly id: number
}

export class SnapshotInterestStateImpl
  extends InterestStateImpl
  implements SnapshotInterestState
{
  readonly id

  constructor(
    id: number,
    subjectType: j.Type,
    subjectPrioritizer: SubjectPrioritizer,
    sendRate: number,
  ) {
    super(subjectType, subjectPrioritizer, sendRate)
    this.id = id
  }
}

export interface SnapshotInterest extends Interest {
  readonly id: number
  init(): SnapshotInterestState
}

export class SnapshotInterestImpl
  extends InterestImpl
  implements SnapshotInterest
{
  readonly id

  constructor(
    subjectType: j.Type,
    subjectPrioritizer: SubjectPrioritizer,
    sendRate: number,
  ) {
    super(subjectType, subjectPrioritizer, sendRate)
    this.id = snapshotInterestIds++
  }

  init() {
    return new SnapshotInterestStateImpl(
      this.id,
      this.subjectType,
      this.subjectPrioritizer,
      this.sendRate,
    )
  }
}

export let makeSnapshotInterest = (
  subjectType: j.Type,
  subjectPrioritizer: SubjectPrioritizer = () => 1,
): SnapshotInterest =>
  new SnapshotInterestImpl(subjectType, subjectPrioritizer, 1 / 20)
