import React, { forwardRef, useEffect, useRef } from "react"
import "./App.css"
import { component } from "@javelin/ecs"
import { Canvas, CanvasRef } from "./Canvas"
import { Camera } from "./ecs/components"
import { createRenderSystem } from "./ecs/sys_render"
import { world } from "./ecs/world"
import { useWindowSize } from "./hooks/useWindowSize"

const Render = forwardRef<CanvasRef>(function Render(props, ref) {
  const size = useWindowSize()
  return <Canvas {...size} ref={ref} />
})

function App() {
  const canvas = useRef<CanvasRef>(null)

  useEffect(() => {
    let running = true
    const step = (t: number) => {
      if (running) {
        world.tick(t)
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)

    return () => {
      running = false
    }
  }, [])

  useEffect(() => {
    const camera = world.spawn(component(Camera))
    if (canvas.current && canvas.current.context) {
      world.addSystem(createRenderSystem(world, canvas.current, camera))
    }
  }, [canvas.current])

  return (
    <div className="App">
      <Render ref={canvas} />
    </div>
  )
}

export default App
;(window as any).world = world
