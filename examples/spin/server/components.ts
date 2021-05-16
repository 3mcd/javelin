import { arrayOf, boolean, number, registerSchema } from "@javelin/ecs"
import { ChangeSet } from "@javelin/track"

export const Changes = { ...ChangeSet }

export const Player = {
  clientId: number,
  initialized: boolean,
}

export const Transform = {
  position: arrayOf(number),
  // add some overhead for comparison between sync/patch
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

registerSchema(Changes, 1)
registerSchema(Player, 2)
registerSchema(Transform, 3)
registerSchema(Big, 4)
registerSchema(Shell, 5)
