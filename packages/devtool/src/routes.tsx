import React from "react"
import { Route, Switch } from "react-router-dom"
import { Spawn } from "./screens/spawn"
import { World } from "./screens/world"
import { Inspect } from "./screens/inspect"

export function Routes() {
  return (
    <Switch>
      <Route path="/:world/inspect" component={Inspect} />
      <Route path="/:world/spawn" component={Spawn} />
      <Route path="/:world" component={World} />
    </Switch>
  )
}
