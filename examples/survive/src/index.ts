import {app, Group} from "@javelin/ecs"
import {auraPlugin} from "./aura.js"
import {bulletPlugin} from "./bullet.js"
import {clockPlugin} from "./clock.js"
import {disposePlugin} from "./dispose.js"
import {enemyPlugin} from "./enemy.js"
import {healthPlugin} from "./health.js"
import {lootPlugin} from "./loot.js"
import {playerPlugin} from "./player.js"
import {renderPlugin} from "./render.js"
import {timePlugin} from "./time.js"

let canvas = document.querySelector("canvas")!
let canvasContext = canvas.getContext("2d")!

let onResize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvasContext.scale(10, 10)
}
onResize()

window.addEventListener("resize", onResize)

let game = app()
  .addGroup("render", _ =>
    _.after(Group.LateUpdate).before(Group.Late),
  )
  .use(timePlugin)
  .use(clockPlugin)
  .use(disposePlugin)
  .use(bulletPlugin)
  .use(healthPlugin)
  .use(enemyPlugin)
  .use(playerPlugin)
  .use(renderPlugin)
  .use(lootPlugin)
  .use(auraPlugin)

let loop = () => {
  game.step()
  requestAnimationFrame(loop)
}
loop()
