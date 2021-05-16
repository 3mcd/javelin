import { createQuery } from "@javelin/ecs"
import { Big, Changes, Player, Shell, Transform } from "./components"

export const qryPlayers = createQuery(Player)
export const qryTransforms = createQuery(Transform)
export const qryTransformsWBig = createQuery(Transform, Big)
export const qryTransformsWChanges = createQuery(Transform, Changes)
export const qryTransformsWShell = createQuery(Transform, Shell, Changes)
