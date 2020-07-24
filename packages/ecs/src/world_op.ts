import { Component } from "./component"

export enum WorldOpType {
  Create,
  Insert,
  Remove,
  Destroy,
}

export type CreateOp = [
  WorldOpType.Create,
  number,
  ReadonlyArray<Component>,
  number?,
]
export type InsertOp = [WorldOpType.Insert, number, ReadonlyArray<Component>]
export type RemoveOp = [WorldOpType.Remove, number, ReadonlyArray<Component>]
export type DestroyOp = [WorldOpType.Destroy, number]

export type WorldOp = CreateOp | InsertOp | RemoveOp | DestroyOp
