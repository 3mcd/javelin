import * as j from "@javelin/ecs"
import {Aura} from "./aura.js"
import {Box} from "./box.js"
import {makeBullet} from "./bullet.js"
import {Health} from "./health.js"
import {Quiver} from "./loot.js"
import {Position} from "./position.js"

export const PLAYER_WIDTH = 2
export const PLAYER_HEIGHT = 2
export const PLAYER_SHOOT_RADIUS = 1
export const PLAYER_SHOOT_COUNT = 4
export const PLAYER_MAX_HEALTH = 10

export let IsPlayer = j.tag()
export let Player = j.type(IsPlayer, Position, Box, Health, Quiver, Aura)

export let makePlayerSystem = (world: j.World) =>
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

export let playerMovementSystem = (world: j.World) =>
  world
    .query(Player)
    .as(Position)
    .each((_, playerPos) => {
      let h =
        Number(poll("ArrowRight") || poll("d")) -
        Number(poll("ArrowLeft") || poll("a"))
      let v =
        Number(poll("s") || poll("ArrowDown")) -
        Number(poll("w") || poll("ArrowUp"))
      playerPos.x += 0.2 * h
      playerPos.y += 0.2 * v
    })

export let playerWeaponsSystem = (world: j.World) => {
  let time = world.getResource(j.FixedTime)
  world
    .query(Player)
    .as(Position, Quiver)
    .each((player, playerPos, playerQuiver) => {
      let bulletCount = Math.ceil(PLAYER_SHOOT_COUNT + playerQuiver / 100)
      for (let i = 0; i < bulletCount; i++) {
        let bulletAngle = (2 * Math.PI * i) / bulletCount
        let bulletX = playerPos.x + PLAYER_SHOOT_RADIUS * Math.cos(bulletAngle)
        let bulletY = playerPos.y + PLAYER_SHOOT_RADIUS * Math.sin(bulletAngle)
        let bulletPierce = 0
        if (playerQuiver > 0) {
          bulletPierce = 3
          playerQuiver--
        }
        makeBullet(
          world,
          bulletX,
          bulletY,
          playerPos.x,
          playerPos.y,
          time.currentTime + 1,
          bulletPierce,
        )
        world.set(player, Quiver, playerQuiver)
      }
    })
}

export let playerPlugin = (app: j.App) =>
  app
    .addInitSystem(makePlayerSystem)
    .addSystemToGroup(j.FixedGroup.EarlyUpdate, playerMovementSystem)
    .addSystemToGroup(
      j.FixedGroup.EarlyUpdate,
      playerWeaponsSystem,
      null,
      (world: j.World) => world.getResource(j.FixedStep) % 100 === 0,
    )
