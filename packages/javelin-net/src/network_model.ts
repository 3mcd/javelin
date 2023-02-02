import * as j from "@javelin/ecs"

export type NetworkTerm = j.Singleton | j.Relation
export type NetworkTerms = NetworkTerm[]

export let NetworkModel = j.resource<NetworkTerms>()

type NormalizedNetworkModel = {
  readonly isoComponentsToLocal: j.Component[]
  readonly localComponentsToIso: number[]
  readonly localCommands: j.Command[]
}
export let NormalizedNetworkModel = j.resource<NormalizedNetworkModel>()

export let normalizeNetworkModel = (
  networkTerms: NetworkTerms,
): NormalizedNetworkModel => {
  let isoComponentsToLocal = [] as j.Component[]
  let localComponentsToIso = [] as number[]
  let localCommands = [] as j.Command[]
  for (let i = 0; i < networkTerms.length; i++) {
    let networkTerm = networkTerms[i]
    if (j.isRelation(networkTerm)) {
      let component = networkTerm.relationTag
      isoComponentsToLocal.push(component)
      localComponentsToIso[component] = i
    } else {
      let component = networkTerm.components[0]
      isoComponentsToLocal.push(component)
      localComponentsToIso[component] = i
      if (j.isCommand(networkTerm)) {
        localCommands.push(networkTerm)
      }
    }
  }
  return {
    isoComponentsToLocal,
    localComponentsToIso,
    localCommands,
  }
}
