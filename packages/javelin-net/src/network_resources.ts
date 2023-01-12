import {resource, Component} from "@javelin/ecs"

export interface NetworkModel {
  isoComponentToLocal(isoComponent: number): Component
  localComponentToIso(localComponent: number): Component
}

export class NetworkModelImpl implements NetworkModel {
  #terms
  #termsSparse

  constructor(terms: Component[]) {
    this.#terms = terms
    this.#termsSparse = [] as Component[]
    for (let i = 0; i < terms.length; i++) {
      this.#termsSparse[terms[i]] = i as Component
    }
  }

  isoComponentToLocal(isoComponent: number) {
    return this.#terms[isoComponent]
  }

  localComponentToIso(localComponent: number) {
    return this.#termsSparse[localComponent]
  }
}

export let NetworkConfig = resource<Component[]>()
export let NetworkModel = resource<NetworkModelImpl>()
