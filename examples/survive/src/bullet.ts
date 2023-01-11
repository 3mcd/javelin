import {App, component, Group, type, World} from "@javelin/ecs"
import {Box} from "./box.js"
import {DisposeTimer} from "./dispose.js"
import {Enemy} from "./enemy.js"
import {Heading} from "./heading.js"
import {Health} from "./health.js"
import {box_intersects, normalize} from "./math.js"
import {Position} from "./position.js"

const BULLET_SIZE = 1

export let BulletDamage = component("f32")
export let BulletPierce = component("f32")
export let BulletCollisions = component<Set<number>>()
export let Bullet = type(
  Position,
  Box,
  Heading,
  BulletDamage,
  DisposeTimer,
  BulletPierce,
  BulletCollisions,
)

export let make_bullet = (
  world: World,
  pos_x: number,
  pos_y: number,
  target_x: number,
  target_y: number,
  dispose_time: number,
  pierce = 0,
) =>
  world.create(
    Bullet,
    {x: pos_x, y: pos_y},
    {x: BULLET_SIZE, y: BULLET_SIZE},
    normalize({x: pos_x - target_x, y: pos_y - target_y}),
    3,
    dispose_time,
    pierce,
    new Set(),
  )

let move_bullets_system = (world: World) =>
  world
    .of(Bullet)
    .as(Position, Heading)
    .each((_, bullet_pos, bullet_heading) => {
      bullet_pos.x += 0.5 * bullet_heading.x
      bullet_pos.y += 0.5 * bullet_heading.y
    })

let collide_bullets_system = (world: World) =>
  world
    .of(Bullet)
    .as(Position, Box, BulletDamage, BulletPierce, BulletCollisions)
    .each(
      (
        bullet,
        bullet_pos,
        bullet_box,
        bullet_damage,
        bullet_pierce,
        bullet_collisions,
      ) =>
        world
          .of(Enemy)
          .as(Position, Box, Health)
          .each((enemy, enemy_pos, enemy_box, enemy_health) => {
            if (
              !bullet_collisions.has(enemy) &&
              box_intersects(
                bullet_pos,
                bullet_box,
                enemy_pos,
                enemy_box,
              )
            ) {
              let next_bullet_pierce = bullet_pierce - 1
              if (next_bullet_pierce <= 0) {
                world.delete(bullet)
              } else {
                world.set(bullet, BulletPierce, next_bullet_pierce)
              }
              world.set(enemy, Health, enemy_health - bullet_damage)
              bullet_collisions.add(enemy)
            }
          }),
    )

export let bullet_plugin = (app: App) =>
  app
    .add_system_to_group(Group.Update, move_bullets_system)
    .add_system_to_group(Group.Update, collide_bullets_system, _ =>
      _.after(move_bullets_system),
    )
