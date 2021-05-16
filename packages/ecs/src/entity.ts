import { Component } from "./component"

export type Entity = number
export type EntitySnapshot = [Entity, Component[]]
export type EntitySnapshotSparse = [Entity, (Component | null)[]]
