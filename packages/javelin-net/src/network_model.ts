import * as j from "@javelin/ecs"

export type NetworkTerm = j.Type<[j.Component]> | j.Relation
export type NetworkTerms = NetworkTerm[]

export let NetworkModel = j.resource<NetworkTerms>()

type NormalizedNetworkModel = {
  readonly localComponents: j.Component[]
  readonly localComponentsToIso: number[]
}
export let NormalizedNetworkModel = j.resource<NormalizedNetworkModel>()

export let normalizeNetworkModel = (
  networkTerms: NetworkTerms,
): NormalizedNetworkModel => {
  let localComponents = [] as j.Component[]
  let localComponentsToIso = [] as number[]
  for (let i = 0; i < networkTerms.length; i++) {
    let networkTerm = networkTerms[i]
    if (j.isRelation(networkTerm)) {
      let component = networkTerm.relationTag
      localComponents.push(component)
      localComponentsToIso[component] = i
    } else {
      let component = networkTerm.components[0]
      localComponents.push(component)
      localComponentsToIso[component] = i
    }
  }
  return {
    localComponents,
    localComponentsToIso,
  }
}
