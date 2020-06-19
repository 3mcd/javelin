import { LogMessage } from "../context/log"
import { useRef, useState, useEffect } from "react"

export function useLogScroll(messages: LogMessage[]) {
  const ref = useRef<HTMLDivElement>(null)
  const [attached, setAttached] = useState(true)
  const { current: el } = ref

  useEffect(() => {
    if (!el) {
      return
    }

    const onScroll = () =>
      setAttached(el.scrollHeight - el.scrollTop === el.clientHeight)

    el.addEventListener("scroll", onScroll)

    return () => el.removeEventListener("scroll", onScroll)
  }, [el])

  useEffect(() => {
    if (!el) {
      return
    }

    if (attached) {
      el.scrollTo({ top: el.scrollHeight })
    }
  }, [attached, messages, el])

  return ref
}
