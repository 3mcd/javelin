import * as j from "@javelin/ecs"
import {FixedTick, Tick} from "@javelin/ecs"
import {
  Interest,
  InterestImpl,
  interestMessageType,
  InterestState,
  InterestStateImpl,
  SubjectPrioritizer,
} from "./interest.js"
import {NetworkMessageType} from "./protocol.js"

export let snapshotInterestMessageType: NetworkMessageType<SnapshotInterestState> =
  {
    encode(writeStream, world, message) {
      writeStream.grow(4)
      writeStream.writeU32(world.getResource(FixedTick))
      interestMessageType.encode(writeStream, world, message)
    },
    decode(readStream, world, entity, length) {
      let serverTick = readStream.readU32()
      interestMessageType.decode(readStream, world, entity, length)
    },
  }

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
