import * as j from "@javelin/ecs"
import {Interest, InterestImpl, InterestState} from "./interest.js"
import {Presence, PresenceImpl, PresenceState} from "./presence.js"
import {
  SnapshotInterest,
  SnapshotInterestImpl,
  SnapshotInterestState,
} from "./snapshot.js"

export interface Awareness {
  readonly interests: Interest[]
  readonly presences: Presence[]
  readonly snapshotInterests: Interest[]
  addInterest(interest: Interest): Awareness
  addPresence(interest: Presence): Awareness
  init(): AwarenessState
}

export interface AwarenessState {
  readonly subjects: Set<j.Entity>
  readonly interests: InterestState[]
  readonly presences: PresenceState[]
  readonly snapshotInterests: SnapshotInterestState[]
}

export class AwarenessStateImpl implements AwarenessState {
  readonly subjects
  readonly interests
  readonly presences
  readonly snapshotInterests

  constructor(
    presences: PresenceState[],
    interests: InterestState[],
    snapshotInterests: SnapshotInterestState[],
  ) {
    this.subjects = new Set<j.Entity>()
    this.presences = presences
    this.interests = interests
    this.snapshotInterests = snapshotInterests
  }
}

export class AwarenessImpl implements Awareness {
  readonly presences
  readonly interests
  readonly snapshotInterests

  constructor(
    presences: Presence[],
    interests: Interest[],
    snapshotInterests: SnapshotInterest[],
  ) {
    this.presences = presences
    this.interests = interests
    this.snapshotInterests = snapshotInterests
  }

  addInterest(interest: Interest): Awareness {
    this.interests.push(interest)
    return this
  }

  addPresence(presence: PresenceImpl): Awareness {
    this.presences.push(presence)
    return this
  }

  init() {
    return new AwarenessStateImpl(
      this.presences.map(presence => presence.init()),
      this.interests.map(interest => interest.init()),
      this.snapshotInterests.map(interest => interest.init()),
    )
  }
}

export let makeAwareness = (
  ...spec: (Presence | Interest | SnapshotInterest)[]
): Awareness => {
  let presences: Presence[] = []
  let interests: Interest[] = []
  let snapshotInterests: SnapshotInterest[] = []
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    if (term instanceof PresenceImpl) {
      presences.push(term)
    } else if (term instanceof InterestImpl) {
      interests.push(term)
    } else if (term instanceof SnapshotInterestImpl) {
      snapshotInterests.push(term)
    }
  }
  return new AwarenessImpl(presences, interests, snapshotInterests)
}
