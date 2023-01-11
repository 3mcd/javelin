import {resource, Term} from "@javelin/ecs"

export interface NetworkModel {
  to_local(iso_term: number): Term
  to_iso(local_term: number): Term
}

export class NetworkModelImpl implements NetworkModel {
  #terms
  #terms_sparse

  constructor(terms: Term[]) {
    this.#terms = terms
    this.#terms_sparse = [] as Term[]
    for (let i = 0; i < terms.length; i++) {
      this.#terms_sparse[terms[i]] = i as Term
    }
  }

  to_local(iso_term: number) {
    return this.#terms[iso_term]
  }

  to_iso(local_term: number) {
    return this.#terms_sparse[local_term]
  }
}

export let NetworkConfig = resource<Term[]>()
export let NetworkModel = resource<NetworkModelImpl>()
