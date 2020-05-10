import { Component } from "@javelin/ecs"

export enum NetworkMessageType {
  Create,
  Remove,
  Change,
  Update,
}

export const protocol = {
  insert(
    components: Component[][],
  ): [NetworkMessageType.Create, Component[][]] {
    return [NetworkMessageType.Create, components]
  },
  remove(entities: number[]): [NetworkMessageType.Remove, number[]] {
    return [NetworkMessageType.Remove, entities]
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
