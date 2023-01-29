import { App, Group, type, value, World } from "@javelin/ecs"
import { Box } from "./box.js"
import { DisposeTimer } from "./dispose.js"
import { Enemy } from "./enemy.js"
import { Heading } from "./heading.js"
import { Health } from "./health.js"
import { boxIntersects, normalize } from "./math.js"
import { Position } from "./position.js"

const BULLET_SIZE = 1

export let BulletDamage = value("f32")
export let BulletPierce = value("f32")
export let BulletCollisions = value<Set<number>>()
export let Bullet = type(
  Position,
  Box,
  Heading,
  BulletDamage,
  DisposeTimer,
  BulletPierce,
  BulletCollisions,
)

export let makeBullet = (
  world: World,
  posX: number,
  posY: number,
  targetX: number,
  targetY: number,
  disposeTime: number,
  pierce = 0,
) =>
  world.create(
    Bullet,
    {x: posX, y: posY},
    {x: BULLET_SIZE, y: BULLET_SIZE},
    normalize({x: posX - targetX, y: posY - targetY}),
    3,
    disposeTime,
    pierce,
    new Set(),
  )

let moveBulletsSystem = (world: World) =>
  world
    .of(Bullet)
    .as(Position, Heading)
    .each((_, bulletPos, bulletHeading) => {
      bulletPos.x += 0.5 * bulletHeading.x
      bulletPos.y += 0.5 * bulletHeading.y
    })

let collideBulletsSystem = (world: World) =>
  world
    .of(Bullet)
    .as(Position, Box, BulletDamage, BulletPierce, BulletCollisions)
    .each(
      (
        bullet,
        bulletPos,
        bulletBox,
        bulletDamage,
        bulletPierce,
        bulletCollisions,
      ) =>
        world
          .of(Enemy)
          .as(Position, Box, Health)
          .each((enemy, enemyPos, enemyBox, enemyHealth) => {
            if (
              !bulletCollisions.has(enemy) &&
              boxIntersects(bulletPos, bulletBox, enemyPos, enemyBox)
            ) {
              let nextBulletPierce = bulletPierce - 1
              if (nextBulletPierce <= 0) {
                world.delete(bullet)
              } else {
                world.set(bullet, BulletPierce, nextBulletPierce)
              }
              world.set(enemy, Health, enemyHealth - bulletDamage)
              bulletCollisions.add(enemy)
            }
          }),
    )

export let bulletPlugin = (app: App) =>
  app
    .addSystemToGroup(Group.Update, moveBulletsSystem)
    .addSystemToGroup(Group.Update, collideBulletsSystem, _ =>
      _.after(moveBulletsSystem),
    )
