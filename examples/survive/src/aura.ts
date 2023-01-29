import * as j from "@javelin/ecs"
import {Box} from "./box.js"
import {Health} from "./health.js"
import {circleBoxIntersects, normalize, subtract} from "./math.js"
import {Position} from "./position.js"

export const AURA_DAMAGE = 1
export const AURA_SCALE_FACTOR = 0.1

export let Aura = j.value("f32")
export let AuraImmune = j.tag()
export let AuraSource = j.type(Aura, Position)
export let AuraTarget = j.type(Position, Box, Health)

let tempVec = {x: 0, y: 0}

export let pushAuraSystem = (world: j.World) =>
  world.of(AuraSource).each((source, sourceAura, sourcePos) => {
    let sourceAuraRadius = sourceAura * AURA_SCALE_FACTOR
    world
      .of(AuraTarget, j.Not(AuraImmune))
      .each((target, targetPos, targetBox) => {
        if (
          source !== target &&
          circleBoxIntersects(sourcePos, sourceAuraRadius, targetPos, targetBox)
        ) {
          let pushDirection = normalize(subtract(targetPos, sourcePos, tempVec))
          targetPos.x += pushDirection.x
          targetPos.y += pushDirection.y
          world.set(source, Aura, Math.max(sourceAura - AURA_SCALE_FACTOR, 0))
        }
      })
  })

export let auraPlugin = (app: j.App) => app.addSystem(pushAuraSystem)
