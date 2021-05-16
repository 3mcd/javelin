import { createQuery } from "@javelin/ecs"
// @ts-ignore
import { Shell, Transform } from "../../../server/components"
import { Interpolate } from "./components"

export const qryTransforms = createQuery(Transform)
export const qryInterpolate = createQuery(Transform, Interpolate)
export const qryShells = createQuery(Shell, Interpolate)
