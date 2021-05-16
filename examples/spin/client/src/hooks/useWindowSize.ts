import { useCallback, useEffect, useState } from "react"

export function useWindowSize() {
  const getDimensions = useCallback(
    () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    [],
  )
  const [dimensions, setDimensions] = useState(getDimensions())
  const onResize = useCallback(() => setDimensions(getDimensions()), [
    getDimensions,
  ])

  useEffect(() => {
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [onResize])

  return dimensions
}
