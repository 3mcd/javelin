import { Component } from "./component"

export type Entity = number
export type EntitySnapshot = [Entity, Component[]]
export type EntitySnapshotWithDiff = [Entity, Component[], (Component | null)[]]
