export const canvas = document.createElement("canvas")
export const context = canvas.getContext("2d")!

canvas.width = 800
canvas.height = 600

canvas.style.width = "800"
canvas.style.height = "600"

document.body.appendChild(canvas)
