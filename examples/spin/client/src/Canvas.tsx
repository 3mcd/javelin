import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react"

export function scaleCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  // assume the device pixel ratio is 1 if the browser doesn't specify it
  const devicePixelRatio = window.devicePixelRatio || 1

  // determine the 'backing store ratio' of the canvas context
  const backingStoreRatio =
    (context as any).webkitBackingStorePixelRatio ||
    (context as any).mozBackingStorePixelRatio ||
    (context as any).msBackingStorePixelRatio ||
    (context as any).oBackingStorePixelRatio ||
    (context as any).backingStorePixelRatio ||
    1

  // determine the actual ratio we want to draw at
  const ratio = devicePixelRatio / backingStoreRatio

  if (devicePixelRatio !== backingStoreRatio) {
    // set the 'real' canvas size to the higher width/height
    canvas.width = width * ratio
    canvas.height = height * ratio

    // ...then scale it back down with CSS
    canvas.style.width = width + "px"
    canvas.style.height = height + "px"
  } else {
    // this is a normal 1:1 device; just scale it simply
    canvas.width = width
    canvas.height = height
    canvas.style.width = ""
    canvas.style.height = ""
  }

  // scale the drawing context so everything will work at the higher ratio
  context.scale(ratio, ratio)
}

export type CanvasProps = {
  width: number
  height: number
  onMouseDown?(position: [number, number]): void
  onMouseMove?(position: [number, number]): void
  onMouseUp?(position: [number, number]): void
}

export type CanvasRef = {
  width: number
  height: number
  context: CanvasRenderingContext2D | null
}

function getCursorPosition(
  canvas: HTMLCanvasElement,
  event: MouseEvent,
): [number, number] {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  return [x, y]
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas(
  props,
  ref,
) {
  const { width, height, onMouseDown, onMouseMove, onMouseUp } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D>()
  const wrapMouseEvent = (
    callback: (vec: [number, number]) => void = () => {},
  ) => (event: React.MouseEvent) => {
    const { current: canvas } = canvasRef

    if (!(canvas && onMouseDown)) {
      return
    }

    callback(getCursorPosition(canvas, event.nativeEvent))
  }
  const _onMouseDown = useCallback(wrapMouseEvent(onMouseDown), [
    onMouseDown,
    width,
    height,
  ])
  const _onMouseMove = useCallback(wrapMouseEvent(onMouseMove), [
    onMouseMove,
    width,
    height,
  ])
  const _onMouseUp = useCallback(wrapMouseEvent(onMouseUp), [
    onMouseUp,
    width,
    height,
  ])

  useEffect(() => {
    if (!(canvasRef.current && contextRef.current)) {
      return
    }
    scaleCanvas(canvasRef.current, contextRef.current, width, height)
  }, [width, height])

  const api = useMemo<CanvasRef>(
    () => ({ width: 0, height: 0, context: null }),
    [],
  )

  useImperativeHandle(
    ref,
    () => {
      const context = contextRef.current || canvasRef.current?.getContext("2d")!
      contextRef.current = context
      api.width = width
      api.height = height
      api.context = context
      return api
    },
    [api, width, height],
  )

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={_onMouseDown}
      onMouseMove={_onMouseMove}
      onMouseUp={_onMouseUp}
    />
  )
})
