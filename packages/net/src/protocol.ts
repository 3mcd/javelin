import { Component } from "@javelin/ecs"

export enum NetworkMessageType {
  Create,
  Destroy,
  Change,
  Update,
}

export const protocol = {
  create(
    components: Component[][],
  ): [NetworkMessageType.Create, Component[][]] {
    return [NetworkMessageType.Create, components]
  },
  destroy(entities: number[]): [NetworkMessageType.Destroy, number[]] {
    return [NetworkMessageType.Destroy, entities]
  },
  change(components: Component[]): [NetworkMessageType.Change, Component[]] {
    return [NetworkMessageType.Change, components]
  },
  update<T>(
    components: Component[],
    metadata: T,
  ): [NetworkMessageType.Update, Component[], T] {
    return [NetworkMessageType.Update, components, metadata]
  },
}

export type Protocol = typeof protocol
export type NetworkMessage = {
  [K in keyof Protocol]: ReturnType<Protocol[K]>
}[keyof Protocol]
