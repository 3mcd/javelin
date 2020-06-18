import React, { createContext, PropsWithChildren, useContext } from "react"
import { WorldConfig } from "../types"
import { JavelinMessage } from "@javelin/net"

export type WorldProviderProps = PropsWithChildren<{
  worlds: WorldConfig[]
  onMessage: (world: WorldConfig, message: JavelinMessage) => unknown
}>

export type WorldProviderAPI = {
  worlds: WorldConfig[]
  sendMessage: (world: WorldConfig, message: JavelinMessage) => void
}

export const worldContext = createContext<WorldProviderAPI>({
  worlds: [],
  sendMessage: () => {},
})

export const useWorld = () => useContext(worldContext)

export function WorldProvider(props: WorldProviderProps) {
  const api: WorldProviderAPI = {
    worlds: props.worlds,
    sendMessage: (world, message) => props.onMessage(world, message),
  }

  return (
    <worldContext.Provider value={api}>{props.children}</worldContext.Provider>
  )
}
