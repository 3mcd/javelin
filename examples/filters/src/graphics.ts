import { Application, Graphics, Text } from "pixi.js"

export const app = new Application({ antialias: false })
export const graphics = new Graphics()
export const framerate = new Text("0", {
  fontFamily: "Arial",
  fontSize: 24,
  fill: 0xffffff,
})

framerate.x = 0

const $render = document.createElement("div")

$render.setAttribute("id", "render")
$render.appendChild(app.view)

document.body.appendChild($render)

app.stage.addChild(graphics)
app.stage.addChild(framerate)
