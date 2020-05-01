import { Application, Graphics, Text } from "pixi.js"

export const app = new Application({
  antialias: false,
  backgroundColor: 0x0a0a0a,
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

let previous = Date.now()
let elapsed = 0
let transferred = 0

const $bandwidth = document.createElement("div")

document.body.appendChild($bandwidth)

export function updateBytesTransferred(bytes: number) {
  const now = Date.now()
  const deltaTime = now - previous

  transferred += bytes / 1000
  elapsed += deltaTime / 1000

  if (deltaTime > 1000) {
    previous = now
    $bandwidth.innerText = `${String(transferred / elapsed)} kb per second`
  }
}
