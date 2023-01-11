import {App, Group, tag, type, World} from "@javelin/ecs"
import {Aura} from "./aura.js"
import {Box} from "./box.js"
import {make_bullet} from "./bullet.js"
import {Clock} from "./clock.js"
import {Health} from "./health.js"
import {Quiver} from "./loot.js"
import {Position} from "./position.js"

export const PLAYER_WIDTH = 2
export const PLAYER_HEIGHT = 2
export const PLAYER_SHOOT_RADIUS = 1
export const PLAYER_SHOOT_COUNT = 4
export const PLAYER_MAX_HEALTH = 10

export let IsPlayer = tag()
export let Player = type(
  IsPlayer,
  Position,
  Box,
  Health,
  Quiver,
  Aura,
)

export let make_player = (world: World) =>
  world.create(
    Player,
    {x: 0, y: 0},
    {x: PLAYER_WIDTH, y: PLAYER_HEIGHT},
    PLAYER_MAX_HEALTH,
    0,
    10,
  )

let keys: Record<string, boolean> = {}

document.addEventListener("keydown", e => {
  keys[e.key] = true
})
document.addEventListener("keyup", e => {
  keys[e.key] = false
})

let poll = (key: string) => Boolean(keys[key])

export let player_movement_system = (world: World) =>
  world
    .of(Player)
    .as(Position)
    .each((_, player_pos) => {
      let h =
        Number(poll("ArrowRight") || poll("d")) -
        Number(poll("ArrowLeft") || poll("a"))
      let v =
        Number(poll("s") || poll("ArrowDown")) -
        Number(poll("w") || poll("ArrowUp"))
      player_pos.x += 0.2 * h
      player_pos.y += 0.2 * v
    })

export let player_weapons_system = (world: World) => {
  let clock = world.get_resource(Clock)
  world
    .of(Player)
    .as(Position, Quiver)
    .each((player, player_pos, player_quiver) => {
      let bullet_count = Math.ceil(
        PLAYER_SHOOT_COUNT + player_quiver / 100,
      )
      for (let i = 0; i < bullet_count; i++) {
        let bullet_angle = (2 * Math.PI * i) / bullet_count
        let bullet_x =
          player_pos.x + PLAYER_SHOOT_RADIUS * Math.cos(bullet_angle)
        let bullet_y =
          player_pos.y + PLAYER_SHOOT_RADIUS * Math.sin(bullet_angle)
        let bullet_pierce = 0
        if (player_quiver > 0) {
          bullet_pierce = 3
          player_quiver--
        }
        make_bullet(
          world,
          bullet_x,
          bullet_y,
          player_pos.x,
          player_pos.y,
          clock.time + 1,
          bullet_pierce,
        )
        world.set(player, Quiver, player_quiver)
      }
    })
}

export let player_plugin = (app: App) =>
  app
    .add_system_to_group(Group.Init, make_player)
    .add_system(player_movement_system)
    .add_system(
      player_weapons_system,
      null,
      (world: World) => world.get_resource(Clock).tick % 100 === 0,
    )
