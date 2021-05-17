import { set } from "@javelin/track"
import { qryTransformsWShell } from "./queries"

export const sysPhysics = () => {
  for (const [
    entities,
    [transforms, shells, changesets],
  ] of qryTransformsWShell) {
    for (let i = 0; i < entities.length; i++) {
      const s = shells[i]
      const t = transforms[i]
      const c = changesets[i]
      const a = Math.atan2(t.position[1], t.position[0]) + 0.01
      set(t, c, "position.0", Math.cos(a) * (s.value * 50))
      set(t, c, "position.1", Math.sin(a) * (s.value * 50))
    }
  }
}
