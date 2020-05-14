export const canvas = document.createElement("canvas")
export const context = canvas.getContext("2d")!

canvas.width = window.innerWidth
canvas.height = window.innerHeight

canvas.style.width = "100%"
canvas.style.height = "100%"

document.body.appendChild(canvas)
