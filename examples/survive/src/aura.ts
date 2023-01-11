import {App, component, tag, type, Without, World} from "@javelin/ecs"
import {Box} from "./box.js"
import {Health} from "./health.js"
import {circle_box_intersects, normalize, subtract} from "./math.js"
import {Position} from "./position.js"

export const AURA_DAMAGE = 1
export const AURA_SCALE_FACTOR = 0.1

export let Aura = component("f32")
export let AuraImmune = tag()
export let AuraSource = type(Aura, Position)
export let AuraTarget = type(Position, Box, Health)

let temp_vec = {x: 0, y: 0}

export let push_aura_system = (world: World) =>
  world.of(AuraSource).each((source, source_aura, source_pos) => {
    let source_aura_radius = source_aura * AURA_SCALE_FACTOR
    world
      .of(AuraTarget, Without(AuraImmune))
      .each((target, target_pos, target_box) => {
        if (
          source !== target &&
          circle_box_intersects(
            source_pos,
            source_aura_radius,
            target_pos,
            target_box,
          )
        ) {
          let push_direction = normalize(
            subtract(target_pos, source_pos, temp_vec),
          )
          target_pos.x += push_direction.x
          target_pos.y += push_direction.y
          world.set(
            source,
            Aura,
            Math.max(source_aura - AURA_SCALE_FACTOR, 0),
          )
        }
      })
  })

export let aura_plugin = (app: App) =>
  app.add_system(push_aura_system)
