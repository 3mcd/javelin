import * as j from "@javelin/ecs"
import {Maybe, SparseSet} from "@javelin/lib"
import {PredictionScope} from "./prediction_scope.js"

type PredictionComponentConfig = Partial<{
  blend(a: unknown, b: unknown, out: Maybe<unknown>, alpha: number): unknown
}>

export type PredictionConfig = {
  components: [j.Singleton, PredictionComponentConfig][]
}

export type NormalizedPredictionConfig = {
  components: PredictionComponentConfig[]
}

export let PredictionConfig = j.resource<Partial<PredictionConfig>>()
export let NormalizedPredictionConfig = j.resource<NormalizedPredictionConfig>()

export let PredictionScopes = j.resource<SparseSet<PredictionScope>>()

export let PredictedWorld = j.resource<j.World>()
export let CorrectedWorld = j.resource<j.World>()
