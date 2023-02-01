import * as j from "@javelin/ecs"
import {Interest, InterestImpl, InterestStateImpl} from "./interest.js"
import {Presence, PresenceImpl, PresenceStateImpl} from "./presence.js"

export interface Awareness {
  readonly interests: InterestImpl[]
  readonly presences: PresenceImpl[]
  addInterest(interest: InterestImpl): Awareness
  addPresence(interest: PresenceImpl): Awareness
  init(): AwarenessState
}

export interface AwarenessState {
  readonly subjects: Set<j.Entity>
  readonly interests: InterestStateImpl[]
  readonly presences: PresenceStateImpl[]
}

export class AwarenessStateImpl implements AwarenessState {
  readonly subjects
  readonly interests
  readonly presences

  constructor(presences: PresenceStateImpl[], interests: InterestStateImpl[]) {
    this.subjects = new Set<j.Entity>()
    this.presences = presences
    this.interests = interests
  }
}

export class AwarenessImpl implements Awareness {
  readonly presences
  readonly interests

  constructor(presences: PresenceImpl[], interests: InterestImpl[]) {
    this.presences = presences
    this.interests = interests
  }

  addInterest(interest: InterestImpl): Awareness {
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
    )
  }
}

export let makeAwareness = (...spec: (Presence | Interest)[]): Awareness =>
  new AwarenessImpl(
    spec.filter((term): term is PresenceImpl => term instanceof PresenceImpl),
    spec.filter((term): term is InterestImpl => term instanceof InterestImpl),
  )
