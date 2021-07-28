import { useRef } from "./use_ref"

export function useInit() {
  const init = useRef(true)
  const value = init.value
  init.value = false
  return value
}
