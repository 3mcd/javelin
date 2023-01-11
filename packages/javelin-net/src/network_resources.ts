import {resource, Term} from "@javelin/ecs"

export interface NetworkModel {
  toLocal(isoTerm: number): Term
  toIso(localTerm: number): Term
}

export class NetworkModelImpl implements NetworkModel {
  #terms
  #termsSparse

  constructor(terms: Term[]) {
    this.#terms = terms
    this.#termsSparse = [] as Term[]
    for (let i = 0; i < terms.length; i++) {
      this.#termsSparse[terms[i]] = i as Term
    }
  }

  toLocal(isoTerm: number) {
    return this.#terms[isoTerm]
  }

  toIso(localTerm: number) {
    return this.#termsSparse[localTerm]
  }
}

export let NetworkConfig = resource<Term[]>()
export let NetworkModel = resource<NetworkModelImpl>()
