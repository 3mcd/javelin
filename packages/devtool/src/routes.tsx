import React from "react"
import { Route, Switch } from "react-router-dom"
import { Spawn } from "./screens/spawn"
import { World } from "./screens/world"

export function Routes() {
  return (
    <Switch>
      <Route path="/:world/spawn" component={Spawn} />
      <Route path="/:world" component={World} />
    </Switch>
  )
}
