import { boolean, number, registerSchema } from "@javelin/ecs"

export const Player = {
  clientId: number,
  initialized: boolean,
}

export const Transform = {
  x: number,
  y: number,
  // add some overhead for comparison between update/patch
  extra: number,
  extra2: number,
  extra3: number,
  extra4: number,
  extra5: number,
  extra6: number,
  extra7: number,
  extra8: number,
}

export const Big = {}

export const Shell = {
  value: number,
}

registerSchema(Player, 1)
registerSchema(Transform, 2)
registerSchema(Big, 3)
registerSchema(Shell, 4)
