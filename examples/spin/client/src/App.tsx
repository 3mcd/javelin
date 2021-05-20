import React, { forwardRef, useEffect, useRef } from "react"
import "./App.css"
import { Canvas, CanvasRef } from "./Canvas"
import { useWindowSize } from "./hooks/useWindowSize"
import { world } from "./world"

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
        world.step(canvas.current)
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)

    return () => {
      running = false
    }
  }, [])

  return (
    <div className="App">
      <Render ref={canvas} />
    </div>
  )
}

export default App
;(window as any).world = world
