import { Application, Graphics, Text } from "pixi.js"

export const app = new Application({
  antialias: false,
  backgroundColor: 0x0a0a0a,
  width: 1680,
  height: 916,
})
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
