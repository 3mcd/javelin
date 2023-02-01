import * as j from "@javelin/ecs"
import {Interest, InterestStateImpl} from "./interest.js"
import {Presence, PresenceState} from "./presence.js"

export interface Awareness {
  readonly interests: Interest[]
  readonly presences: Presence[]
  addInterest(interest: Interest): Awareness
  addPresence(interest: Presence): Awareness
  init(): AwarenessState
}

export interface AwarenessState {
  readonly subjects: Set<j.Entity>
  readonly interests: InterestStateImpl[]
  readonly presences: PresenceState[]
}

export class AwarenessStateImpl implements AwarenessState {
  readonly subjects
  readonly interests
  readonly presences

  constructor(presences: PresenceState[], interests: InterestStateImpl[]) {
    this.subjects = new Set<j.Entity>()
    this.presences = presences
    this.interests = interests
  }
}

export class AwarenessImpl implements Awareness {
  readonly presences
  readonly interests

  constructor(presences: Presence[], interests: Interest[]) {
    this.presences = presences
    this.interests = interests
  }

  addInterest(interest: Interest): Awareness {
    this.interests.push(interest)
    return this
  }

  addPresence(presence: Presence): Awareness {
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
    spec.filter((term): term is Presence => term instanceof Presence),
    spec.filter((term): term is Interest => term instanceof Interest),
  )
