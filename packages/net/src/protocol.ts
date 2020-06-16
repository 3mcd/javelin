import { Component } from "@javelin/ecs"

export enum JavelinMessageType {
  Create,
  Destroy,
  Change,
  Update,
}

export type Create = [JavelinMessageType.Create, Component[]]
export type Destroy = [JavelinMessageType.Destroy, number[]]
export type Change = [JavelinMessageType.Change, Component[]]
export type Update<T> = [JavelinMessageType.Update, Component[], T]

export const protocol = {
  create: (components: Component[]): Create => [
    JavelinMessageType.Create,
    components,
  ],
  destroy: (entities: number[]): Destroy => [
    JavelinMessageType.Destroy,
    entities,
  ],
  change: (components: Component[]): Change => [
    JavelinMessageType.Change,
    components,
  ],
  update: <T>(components: Component[], metadata: T): Update<T> => [
    JavelinMessageType.Update,
    components,
    metadata,
  ],
}

export type JavelinProtocol = typeof protocol
export type JavelinMessage = {
  [K in keyof JavelinProtocol]: ReturnType<JavelinProtocol[K]>
}[keyof JavelinProtocol]
