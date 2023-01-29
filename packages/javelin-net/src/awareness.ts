import {Presence} from "./presence.js"

export interface IAwareness {
  readonly presences: Presence[]
  addPresence(interest: Presence): IAwareness
}

export class AwarenessBuilder implements IAwareness {
  readonly presences

  constructor() {
    this.presences = [] as Presence[]
  }

  addPresence(interest: Presence): IAwareness {
    this.presences.push(interest)
    return this
  }
}

export let makeAwareness = () => new AwarenessBuilder()
