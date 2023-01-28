import {Interest} from "./interest.js"

export interface IAwareness {
  readonly interests: Interest[]
  addInterest(interest: Interest): IAwareness
}

export class AwarenessBuilder implements IAwareness {
  readonly interests

  constructor() {
    this.interests = [] as Interest[]
  }

  addInterest(interest: Interest): IAwareness {
    this.interests.push(interest)
    return this
  }
}

export let makeAwareness = () => new AwarenessBuilder()
