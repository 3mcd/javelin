import {Presence} from "./presence.js"

export interface IAwareness {
  readonly interests: Presence[]
  addInterest(interest: Presence): IAwareness
}

export class AwarenessBuilder implements IAwareness {
  readonly interests

  constructor() {
    this.interests = [] as Presence[]
  }

  addInterest(interest: Presence): IAwareness {
    this.interests.push(interest)
    return this
  }
}

export let makeAwareness = () => new AwarenessBuilder()
