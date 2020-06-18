import React, { createContext, PropsWithChildren, useContext } from "react"
import { WorldConfig } from "../types"

export type WorldProviderProps = PropsWithChildren<{
  worlds: WorldConfig[]
}>

export type WorldProviderAPI = {
  worlds: WorldConfig[]
}

export const worldContext = createContext<WorldProviderAPI>({
  worlds: [],
})

export const useWorld = () => useContext(worldContext)

export function WorldProvider(props: WorldProviderProps) {
  const api = {
    worlds: props.worlds,
  }

  return (
    <worldContext.Provider value={api}>{props.children}</worldContext.Provider>
  )
}
