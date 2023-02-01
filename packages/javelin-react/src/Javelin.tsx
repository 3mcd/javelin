import * as React from "react"

import {app, App} from "@javelin/ecs"

export const javelinAppContext = React.createContext<App>(
  null as unknown as App,
)

export const Javelin: React.FC<React.PropsWithChildren<{app?: App}>> = ({
  app: appValue = app(),
  children,
}) => {
  return (
    <javelinAppContext.Provider value={appValue}>
      {children}
    </javelinAppContext.Provider>
  )
}

export const useApp = () => React.useContext(javelinAppContext)
