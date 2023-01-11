import {App, Group, resource, World} from "@javelin/ecs"
import {
  bat_sprites,
  loot_sprites,
  orb_sprites,
  rat_sprites,
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

let draw_sprite = (
  canvas_context: CanvasRenderingContext2D,
  pos: Vector2,
  sprite: HTMLCanvasElement,
) => {
  canvas_context.save()
  canvas_context.translate(pos.x, pos.y)
  canvas_context.scale(0.1, 0.1)
  canvas_context.drawImage(
    sprite,
    -sprite.width / 2,
    -sprite.height / 2,
  )
  canvas_context.restore()
}

let draw_circle = (
  canvas_context: CanvasRenderingContext2D,
  pos: Vector2,
  radius: number,
  color: string,
  fill = false,
) => {
  canvas_context.save()
  canvas_context.translate(pos.x, pos.y)
  canvas_context.strokeStyle = color
  canvas_context.lineWidth = 0.2
  canvas_context.beginPath()
  canvas_context.arc(0, 0, radius, 0, 2 * Math.PI)
  canvas_context.stroke()
  if (fill) {
    canvas_context.globalAlpha = 0.1
    canvas_context.fillStyle = color
    canvas_context.fill()
  }
  canvas_context.restore()
}

let resize_viewport_system = (world: World) => {
  let viewport = world.get_resource(Viewport)
  let canvas = world.get_resource(Canvas)
  let on_resize = () => {
    let rect = canvas.getBoundingClientRect()
    viewport.x = rect.width
    viewport.y = rect.height
  }
  document.addEventListener("resize", on_resize)
  on_resize()
}

let clear_canvas_system = (world: World) => {
  let viewport = world.get_resource(Viewport)
  let canvas_context = world.get_resource(CanvasContext)
  canvas_context.clearRect(0, 0, viewport.x, viewport.y)
}

let draw_players_system = (world: World) => {
  let canvas_context = world.get_resource(CanvasContext)
  world
    .of(Player)
    .as(Position)
    .each((_, player_pos) =>
      draw_sprite(canvas_context, player_pos, rat_sprites[2][4]),
    )
}

let draw_enemies_system = (world: World) => {
  let canvas_context = world.get_resource(CanvasContext)
  world
    .of(Enemy)
    .as(Position)
    .each((enemy, enemy_pos) =>
      draw_sprite(
        canvas_context,
        enemy_pos,
        world.get(enemy, AuraImmune)
          ? bat_sprites[0][0]
          : bat_sprites[1][0],
      ),
    )
}

let draw_bullets_system = (world: World) => {
  let canvas_context = world.get_resource(CanvasContext)
  world
    .of(Bullet)
    .as(Position)
    .each((_, bullet_pos) =>
      draw_sprite(canvas_context, bullet_pos, orb_sprites[0][0]),
    )
}

let draw_loot_system = (world: World) => {
  let canvas_context = world.get_resource(CanvasContext)
  world
    .of(LootBag)
    .as(Position)
    .each((_, loot_pos) =>
      draw_sprite(canvas_context, loot_pos, loot_sprites[0][0]),
    )
}

let draw_auras_system = (world: World) => {
  let canvas_context = world.get_resource(CanvasContext)
  world
    .of(AuraSource)
    .each((_, aura, aura_pos) =>
      draw_circle(
        canvas_context,
        aura_pos,
        aura * AURA_SCALE_FACTOR,
        "#12a6fc",
        true,
      ),
    )
}

let draw_health_system = (world: World) => {
  let canvas_context = world.get_resource(CanvasContext)
  let viewport = world.get_resource(Viewport)
  world
    .of(Player)
    .as(Health)
    .each((_, player_health) => {
      canvas_context.font = "2px sans-serif"
      canvas_context.fillStyle = "#ffffff"
      canvas_context.fillText(
        `health: ${player_health}`,
        viewport.x / 10 - 10,
        viewport.y / 10 - 2,
      )
    })
}

let draw_quiver_system = (world: World) => {
  let canvas_context = world.get_resource(CanvasContext)
  let viewport = world.get_resource(Viewport)
  world
    .of(Player)
    .as(Quiver)
    .each((_, player_quiver) => {
      canvas_context.font = "2px sans-serif"
      canvas_context.fillStyle = "#ffffff"
      canvas_context.fillText(
        `quiver: ${player_quiver}`,
        viewport.x / 10 - 10,
        viewport.y / 10 - 5,
      )
    })
}

export let render_plugin = (app: App) => {
  let canvas = document.querySelector("canvas")!
  let canvas_context = canvas.getContext("2d")!
  app
    .add_resource(Canvas, canvas)
    .add_resource(CanvasContext, canvas_context)
    .add_resource(Viewport, {x: 0, y: 0})
    .add_system_to_group(Group.Init, resize_viewport_system)
    .add_system_to_group(Group.LateUpdate, clear_canvas_system)
    .add_system_to_group("render", draw_players_system)
    .add_system_to_group("render", draw_enemies_system, _ =>
      _.after(draw_players_system),
    )
    .add_system_to_group("render", draw_bullets_system, _ =>
      _.after(draw_enemies_system),
    )
    .add_system_to_group("render", draw_loot_system, _ =>
      _.before(draw_players_system),
    )
    .add_system_to_group("render", draw_auras_system, _ =>
      _.before(draw_players_system),
    )
    .add_system_to_group(Group.Late, draw_health_system)
    .add_system_to_group(Group.Late, draw_quiver_system)
}
