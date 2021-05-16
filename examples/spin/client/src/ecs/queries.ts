import { createQuery } from "@javelin/ecs"
// @ts-ignore
import { Shell, Transform } from "../../../server/components"
import { Interpolate } from "./components"

export const qry_transforms = createQuery(Transform)
export const qry_interpolate = createQuery(Transform, Interpolate)
export const qry_shells = createQuery(Shell, Interpolate)
