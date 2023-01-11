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
import {boxIntersects, distance, normalize, Vector2} from "./math.js"
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

let enemySpawnBounds = {x: 100, y: 100}
let enemySpawnPoints = [
  [-enemySpawnBounds.x * 0.5, -enemySpawnBounds.y * 0.5],
  [-enemySpawnBounds.x * 0.5, 0],
  [-enemySpawnBounds.x * 0.5, enemySpawnBounds.y * 0.5],
  [0, enemySpawnBounds.y * 0.5],
  [enemySpawnBounds.x * 0.5, enemySpawnBounds.y * 0.5],
  [enemySpawnBounds.x * 0.5, 0],
  [enemySpawnBounds.x * 0.5, -enemySpawnBounds.y * 0.5],
  [0, -enemySpawnBounds.y * 0.5],
]

let makeEnemy = (
  world: World,
  x: number,
  y: number,
  heading: Vector2,
  health = 5,
  auraImmune = false,
) =>
  world.create(
    // @ts-ignore
    auraImmune
      ? type(Enemy, EnemyType(Bat), AuraImmune)
      : type(Enemy, EnemyType(Bat)),
    {x, y},
    {
      x: auraImmune ? ENEMY_WIDTH / 2 : ENEMY_WIDTH,
      y: auraImmune ? ENEMY_HEIGHT / 2 : ENEMY_HEIGHT,
    },
    heading,
    health,
    undefined,
    {},
  )

let acquireEnemyTarget = (
  world: World,
  enemyPos: Vector2,
  heading: Vector2,
) => {
  let targetPos: Vector2 | undefined
  let targetDistance = Infinity
  world
    .of(Player)
    .as(Position)
    .each((_, playerPos) => {
      let playerDistance = distance(enemyPos, playerPos)
      if (playerDistance < targetDistance) {
        targetPos = playerPos
        targetDistance = playerDistance
      }
    })
  if (targetPos) {
    heading.x = targetPos.x - enemyPos.x
    heading.y = targetPos.y - enemyPos.y
    normalize(heading, heading)
  }
  return heading
}

let spawnEnemiesSystem = (world: World) => {
  let {tick} = world.getResource(Clock)
  let enemySpawnCount = Math.ceil(tick / ENEMY_SPAWN_FACTOR)
  world
    .of(Player)
    .as(Position)
    .each((_, playerPos) => {
      while (enemySpawnCount-- > 0) {
        let spawnPointIndex = Math.floor(
          Math.random() * enemySpawnPoints.length,
        )
        let [enemySpawnOffsetX, enemySpawnOffsetY] =
          enemySpawnPoints[spawnPointIndex]
        let enemyX =
          playerPos.x - enemySpawnOffsetX * Math.random() * 10
        let enemyY =
          playerPos.y - enemySpawnOffsetY * Math.random() * 10
        let heading = acquireEnemyTarget(
          world,
          {x: enemyX, y: enemyY},
          {x: 0, y: 0},
        )
        makeEnemy(
          world,
          enemyX,
          enemyY,
          heading,
          undefined,
          tick > 1000 && Math.random() > 0.9,
        )
      }
    })
}

let acquireEnemyTargetsSystem = (world: World) =>
  world
    .of(Enemy, EnemyType(Bat))
    .as(Position, Heading)
    .each((_, enemyPos, enemyHeading) =>
      acquireEnemyTarget(world, enemyPos, enemyHeading),
    )

let moveEnemiesSystem = (world: World) =>
  world
    .of(Enemy)
    .as(Position, Heading)
    .each((_, enemyPos, enemyHeading) => {
      enemyPos.x += enemyHeading.x * 0.1
      enemyPos.y += enemyHeading.y * 0.1
    })

let enemyAttackSystem = (world: World) => {
  let clock = world.getResource(Clock)
  world
    .of(Player)
    .as(Position, Box, Health)
    .each((player, playerPos, playerBox, playerHealth) => {
      world
        .of(Enemy)
        .as(Position, Box, EnemyAttackTime)
        .each((enemy, enemyPos, enemyBox, enemyAttackTime) => {
          if (
            clock.time >= enemyAttackTime &&
            boxIntersects(
              playerPos,
              playerBox,
              enemyPos,
              enemyBox,
            )
          ) {
            let nextPlayerHealth =
              playerHealth - Math.ceil(Math.random() * 2)
            let nextEnemyAttackTime = clock.time + 4
            world.set(player, Health, nextPlayerHealth)
            world.set(enemy, EnemyAttackTime, nextEnemyAttackTime)
          }
        })
    })
}

export let enemyPlugin = (app: App) =>
  app
    .addSystemToGroup(
      Group.EarlyUpdate,
      spawnEnemiesSystem,
      null,
      world =>
        world.getResource(Clock).tick % ENEMY_SPAWN_FREQUENCY === 0,
    )
    .addSystem(acquireEnemyTargetsSystem)
    .addSystem(moveEnemiesSystem, _ =>
      _.after(acquireEnemyTargetsSystem),
    )
    .addSystem(enemyAttackSystem)
