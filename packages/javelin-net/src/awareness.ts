import {Presence} from "./presence.js"

export interface IAwareness {
  readonly presences: Presence[]
  addPresence(interest: Presence): IAwareness
}

export class AwarenessBuilder implements IAwareness {
  readonly presences

  constructor(presences: Presence[]) {
    this.presences = presences
  }

  addPresence(interest: Presence): IAwareness {
    this.presences.push(interest)
    return this
  }
}

export let makeAwareness = (...presences: Presence[]) =>
  new AwarenessBuilder(presences)
