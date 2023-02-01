/* https://medium.com/@alexandereardon/uselayouteffect-and-ssr-192986cdcf7a */

import {useEffect, useLayoutEffect} from "react"

// TODO - this might not work with deno :) - says Cody
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect
