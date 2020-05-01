import { Storage } from "@javelin/ecs"

export type System = (storage: Storage, dt: number) => void

export enum ConnectionType {
  Reliable,
  Unreliable,
}
