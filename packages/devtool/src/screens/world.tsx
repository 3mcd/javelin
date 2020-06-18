import React from "react"
import { Link, useParams } from "react-router-dom"
import { Screen } from "../components/screen"

export function World() {
  const { world } = useParams()

  return (
    <Screen title={`World: ${world}`}>
      <ul>
        <li>
          <Link to={`/${world}/spawn`}>Spawn</Link>
        </li>
      </ul>
    </Screen>
  )
}
