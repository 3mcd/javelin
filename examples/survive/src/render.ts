import {App, Group, resource, World} from "@javelin/ecs"
import {
  batSprites,
  lootSprites,
  orbSprites,
  ratSprites,
} from "../assets/index.js"
import {AuraImmune, AuraSource, AURA_SCALE_FACTOR} from "./aura.js"
import {Bullet} from "./bullet.js"
import {Enemy} from "./enemy.js"
import {Health} from "./health.js"
import {LootBag, Quiver} from "./loot.js"
import {Vector2} from "./math.js"
import {Player} from "./player.js"
import {Position} from "./position.js"

let Canvas = resource<HTMLCanvasElement>()
let CanvasContext = resource<CanvasRenderingContext2D>()
let Viewport = resource<Vector2>()

let drawSprite = (
  canvasContext: CanvasRenderingContext2D,
  pos: Vector2,
  sprite: HTMLCanvasElement,
) => {
  canvasContext.save()
  canvasContext.translate(pos.x, pos.y)
  canvasContext.scale(0.1, 0.1)
  canvasContext.drawImage(
    sprite,
    -sprite.width / 2,
    -sprite.height / 2,
  )
  canvasContext.restore()
}

let drawCircle = (
  canvasContext: CanvasRenderingContext2D,
  pos: Vector2,
  radius: number,
  color: string,
  fill = false,
) => {
  canvasContext.save()
  canvasContext.translate(pos.x, pos.y)
  canvasContext.strokeStyle = color
  canvasContext.lineWidth = 0.2
  canvasContext.beginPath()
  canvasContext.arc(0, 0, radius, 0, 2 * Math.PI)
  canvasContext.stroke()
  if (fill) {
    canvasContext.globalAlpha = 0.1
    canvasContext.fillStyle = color
    canvasContext.fill()
  }
  canvasContext.restore()
}

let resizeViewportSystem = (world: World) => {
  let viewport = world.getResource(Viewport)
  let canvas = world.getResource(Canvas)
  let onResize = () => {
    let rect = canvas.getBoundingClientRect()
    viewport.x = rect.width
    viewport.y = rect.height
  }
  document.addEventListener("resize", onResize)
  onResize()
}

let clearCanvasSystem = (world: World) => {
  let viewport = world.getResource(Viewport)
  let canvasContext = world.getResource(CanvasContext)
  canvasContext.clearRect(0, 0, viewport.x, viewport.y)
}

let drawPlayersSystem = (world: World) => {
  let canvasContext = world.getResource(CanvasContext)
  world
    .of(Player)
    .as(Position)
    .each((_, playerPos) =>
      drawSprite(canvasContext, playerPos, ratSprites[2][4]),
    )
}

let drawEnemiesSystem = (world: World) => {
  let canvasContext = world.getResource(CanvasContext)
  world
    .of(Enemy)
    .as(Position)
    .each((enemy, enemyPos) =>
      drawSprite(
        canvasContext,
        enemyPos,
        world.get(enemy, AuraImmune)
          ? batSprites[0][0]
          : batSprites[1][0],
      ),
    )
}

let drawBulletsSystem = (world: World) => {
  let canvasContext = world.getResource(CanvasContext)
  world
    .of(Bullet)
    .as(Position)
    .each((_, bulletPos) =>
      drawSprite(canvasContext, bulletPos, orbSprites[0][0]),
    )
}

let drawLootSystem = (world: World) => {
  let canvasContext = world.getResource(CanvasContext)
  world
    .of(LootBag)
    .as(Position)
    .each((_, lootPos) =>
      drawSprite(canvasContext, lootPos, lootSprites[0][0]),
    )
}

let drawAurasSystem = (world: World) => {
  let canvasContext = world.getResource(CanvasContext)
  world
    .of(AuraSource)
    .each((_, aura, auraPos) =>
      drawCircle(
        canvasContext,
        auraPos,
        aura * AURA_SCALE_FACTOR,
        "#12a6fc",
        true,
      ),
    )
}

let drawHealthSystem = (world: World) => {
  let canvasContext = world.getResource(CanvasContext)
  let viewport = world.getResource(Viewport)
  world
    .of(Player)
    .as(Health)
    .each((_, playerHealth) => {
      canvasContext.font = "2px sans-serif"
      canvasContext.fillStyle = "#ffffff"
      canvasContext.fillText(
        `health: ${playerHealth}`,
        viewport.x / 10 - 10,
        viewport.y / 10 - 2,
      )
    })
}

let drawQuiverSystem = (world: World) => {
  let canvasContext = world.getResource(CanvasContext)
  let viewport = world.getResource(Viewport)
  world
    .of(Player)
    .as(Quiver)
    .each((_, playerQuiver) => {
      canvasContext.font = "2px sans-serif"
      canvasContext.fillStyle = "#ffffff"
      canvasContext.fillText(
        `quiver: ${playerQuiver}`,
        viewport.x / 10 - 10,
        viewport.y / 10 - 5,
      )
    })
}

export let renderPlugin = (app: App) => {
  let canvas = document.querySelector("canvas")!
  let canvasContext = canvas.getContext("2d")!
  app
    .addResource(Canvas, canvas)
    .addResource(CanvasContext, canvasContext)
    .addResource(Viewport, {x: 0, y: 0})
    .addSystemToGroup(Group.Init, resizeViewportSystem)
    .addSystemToGroup(Group.LateUpdate, clearCanvasSystem)
    .addSystemToGroup("render", drawPlayersSystem)
    .addSystemToGroup("render", drawEnemiesSystem, _ =>
      _.after(drawPlayersSystem),
    )
    .addSystemToGroup("render", drawBulletsSystem, _ =>
      _.after(drawEnemiesSystem),
    )
    .addSystemToGroup("render", drawLootSystem, _ =>
      _.before(drawPlayersSystem),
    )
    .addSystemToGroup("render", drawAurasSystem, _ =>
      _.before(drawPlayersSystem),
    )
    .addSystemToGroup(Group.Late, drawHealthSystem)
    .addSystemToGroup(Group.Late, drawQuiverSystem)
}
