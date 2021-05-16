import { createQuery } from "@javelin/ecs"
import { Big, Changes, Player, Shell, Transform } from "./components"

export const qry_players = createQuery(Player)
export const qry_transforms = createQuery(Transform)
export const qry_transforms_w_big = createQuery(Transform, Big)
export const qry_transforms_w_changes = createQuery(Transform, Changes)
export const qry_transforms_w_shell = createQuery(Transform, Shell, Changes)
