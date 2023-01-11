import {
  App,
  component,
  Group,
  tag,
  type,
  slot,
  World,
} from "@javelin/ecs"
import {AuraImmune} from "./aura.js"
import {Box} from "./box.js"
import {Clock} from "./clock.js"
import {Heading} from "./heading.js"
import {Health} from "./health.js"
import {box_intersects, distance, normalize, Vector2} from "./math.js"
import {Player} from "./player.js"
import {Position} from "./position.js"

export const ENEMY_WIDTH = 2
export const ENEMY_HEIGHT = 2
export const ENEMY_SPAWN_FREQUENCY = 1_000
export const ENEMY_SPAWN_FACTOR = 100

let Bat = component()
let Rat = component()

export let EnemyType = slot(Bat, Rat)

export let IsEnemy = tag()
export let EnemyAttackTime = component("f32")
export let Enemy = type(
  IsEnemy,
  Position,
  Box,
  Heading,
  Health,
  EnemyAttackTime,
)

let enemy_spawn_bounds = {x: 100, y: 100}
let enemy_spawn_points = [
  [-enemy_spawn_bounds.x * 0.5, -enemy_spawn_bounds.y * 0.5],
  [-enemy_spawn_bounds.x * 0.5, 0],
  [-enemy_spawn_bounds.x * 0.5, enemy_spawn_bounds.y * 0.5],
  [0, enemy_spawn_bounds.y * 0.5],
  [enemy_spawn_bounds.x * 0.5, enemy_spawn_bounds.y * 0.5],
  [enemy_spawn_bounds.x * 0.5, 0],
  [enemy_spawn_bounds.x * 0.5, -enemy_spawn_bounds.y * 0.5],
  [0, -enemy_spawn_bounds.y * 0.5],
]

let make_enemy = (
  world: World,
  x: number,
  y: number,
  heading: Vector2,
  health = 5,
  aura_immune = false,
) =>
  world.create(
    // @ts-ignore
    aura_immune
      ? type(Enemy, EnemyType(Bat), AuraImmune)
      : type(Enemy, EnemyType(Bat)),
    {x, y},
    {
      x: aura_immune ? ENEMY_WIDTH / 2 : ENEMY_WIDTH,
      y: aura_immune ? ENEMY_HEIGHT / 2 : ENEMY_HEIGHT,
    },
    heading,
    health,
    undefined,
    {},
  )

let acquire_enemy_target = (
  world: World,
  enemy_pos: Vector2,
  heading: Vector2,
) => {
  let target_pos: Vector2 | undefined
  let target_distance = Infinity
  world
    .of(Player)
    .as(Position)
    .each((_, player_pos) => {
      let player_distance = distance(enemy_pos, player_pos)
      if (player_distance < target_distance) {
        target_pos = player_pos
        target_distance = player_distance
      }
    })
  if (target_pos) {
    heading.x = target_pos.x - enemy_pos.x
    heading.y = target_pos.y - enemy_pos.y
    normalize(heading, heading)
  }
  return heading
}

let spawn_enemies_system = (world: World) => {
  let {tick} = world.get_resource(Clock)
  let enemy_spawn_count = Math.ceil(tick / ENEMY_SPAWN_FACTOR)
  world
    .of(Player)
    .as(Position)
    .each((_, player_pos) => {
      while (enemy_spawn_count-- > 0) {
        let spawn_point_index = Math.floor(
          Math.random() * enemy_spawn_points.length,
        )
        let [enemy_spawn_offset_x, enemy_spawn_offset_y] =
          enemy_spawn_points[spawn_point_index]
        let enemy_x =
          player_pos.x - enemy_spawn_offset_x * Math.random() * 10
        let enemy_y =
          player_pos.y - enemy_spawn_offset_y * Math.random() * 10
        let heading = acquire_enemy_target(
          world,
          {x: enemy_x, y: enemy_y},
          {x: 0, y: 0},
        )
        make_enemy(
          world,
          enemy_x,
          enemy_y,
          heading,
          undefined,
          tick > 1000 && Math.random() > 0.9,
        )
      }
    })
}

let acquire_enemy_targets_system = (world: World) =>
  world
    .of(Enemy, EnemyType(Bat))
    .as(Position, Heading)
    .each((_, enemy_pos, enemy_heading) =>
      acquire_enemy_target(world, enemy_pos, enemy_heading),
    )

let move_enemies_system = (world: World) =>
  world
    .of(Enemy)
    .as(Position, Heading)
    .each((_, enemy_pos, enemy_heading) => {
      enemy_pos.x += enemy_heading.x * 0.1
      enemy_pos.y += enemy_heading.y * 0.1
    })

let enemy_attack_system = (world: World) => {
  let clock = world.get_resource(Clock)
  world
    .of(Player)
    .as(Position, Box, Health)
    .each((player, player_pos, player_box, player_health) => {
      world
        .of(Enemy)
        .as(Position, Box, EnemyAttackTime)
        .each((enemy, enemy_pos, enemy_box, enemy_attack_time) => {
          if (
            clock.time >= enemy_attack_time &&
            box_intersects(
              player_pos,
              player_box,
              enemy_pos,
              enemy_box,
            )
          ) {
            let next_player_health =
              player_health - Math.ceil(Math.random() * 2)
            let next_enemy_attack_time = clock.time + 4
            world.set(player, Health, next_player_health)
            world.set(enemy, EnemyAttackTime, next_enemy_attack_time)
          }
        })
    })
}

export let enemy_plugin = (app: App) =>
  app
    .add_system_to_group(
      Group.EarlyUpdate,
      spawn_enemies_system,
      null,
      world =>
        world.get_resource(Clock).tick % ENEMY_SPAWN_FREQUENCY === 0,
    )
    .add_system(acquire_enemy_targets_system)
    .add_system(move_enemies_system, _ =>
      _.after(acquire_enemy_targets_system),
    )
    .add_system(enemy_attack_system)
