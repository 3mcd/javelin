import {Interest} from "./interest.js"

export interface Awareness {
  readonly interests: Interest[]
  addInterest(interest: Interest): Awareness
}

export class AwarenessBuilder implements Awareness {
  readonly interests

  constructor() {
    this.interests = [] as Interest[]
  }

  addInterest(interest: Interest): Awareness {
    this.interests.push(interest)
    return this
  }
}

export let makeAwareness = () => new AwarenessBuilder()
