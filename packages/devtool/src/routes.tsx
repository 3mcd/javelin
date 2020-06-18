import React from "react"
import { Route, Switch, useHistory, useLocation } from "react-router-dom"
import { World } from "./screens/world"
import { Spawn } from "./screens/spawn"

export function Routes() {
  return (
    <Switch>
      <Route path="/:world/spawn" component={Spawn} />
      <Route path="/:world" component={World} />
    </Switch>
  )
}
