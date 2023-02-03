import * as j from "@javelin/ecs"
import {Interest, InterestImpl, InterestState} from "./interest.js"
import {Presence, PresenceImpl, PresenceState} from "./presence.js"
import {SnapshotInterestImpl} from "./snapshot.js"

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
  readonly snapshotInterests: InterestState[]
}

export class AwarenessStateImpl implements AwarenessState {
  readonly subjects
  readonly interests
  readonly presences
  readonly snapshotInterests

  constructor(
    presences: PresenceState[],
    interests: InterestState[],
    snapshotInterests: InterestState[],
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
    snapshotInterests: Interest[],
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

export let makeAwareness = (...spec: (Presence | Interest)[]): Awareness => {
  let presences: Presence[] = []
  let interests: Interest[] = []
  let snapshotInterests: Interest[] = []
  for (let i = 0; i < spec.length; i++) {
    let term = spec[i]
    if (term instanceof PresenceImpl) {
      presences.push(term)
    } else if (term instanceof InterestImpl) {
      if (term instanceof SnapshotInterestImpl) {
        snapshotInterests.push(term)
      } else {
        interests.push(term)
      }
    }
  }
  return new AwarenessImpl(presences, interests, snapshotInterests)
}
