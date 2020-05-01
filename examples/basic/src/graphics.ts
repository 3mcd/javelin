import { Application, Graphics, Text } from "pixi.js"

export const app = new Application({ antialias: true })
export const graphics = new Graphics()

const $render = document.createElement("div")

$render.setAttribute("id", "render")
$render.appendChild(app.view)

document.body.appendChild($render)

app.stage.addChild(graphics)
