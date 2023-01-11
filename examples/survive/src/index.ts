import {app, Group} from "@javelin/ecs"
import {aura_plugin} from "./aura.js"
import {bullet_plugin} from "./bullet.js"
import {clock_plugin} from "./clock.js"
import {dispose_plugin} from "./dispose.js"
import {enemy_plugin} from "./enemy.js"
import {health_plugin} from "./health.js"
import {loot_plugin} from "./loot.js"
import {player_plugin} from "./player.js"
import {render_plugin} from "./render.js"
import {time_plugin} from "./time.js"

let canvas = document.querySelector("canvas")!
let canvas_context = canvas.getContext("2d")!

let on_resize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas_context.scale(10, 10)
}
on_resize()

window.addEventListener("resize", on_resize)

let game = app()
  .add_group("render", _ =>
    _.after(Group.LateUpdate).before(Group.Late),
  )
  .use(time_plugin)
  .use(clock_plugin)
  .use(dispose_plugin)
  .use(bullet_plugin)
  .use(health_plugin)
  .use(enemy_plugin)
  .use(player_plugin)
  .use(render_plugin)
  .use(loot_plugin)
  .use(aura_plugin)

let loop = () => {
  game.step()
  requestAnimationFrame(loop)
}
loop()
