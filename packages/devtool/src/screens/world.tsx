import React from "react"
import { Link, useParams } from "react-router-dom"
import { Screen } from "../components/screen"
import { useWorld } from "../context/world_provider"

export function World() {
  const { world: worldName } = useParams()
  const { worlds } = useWorld()
  const world = worlds.find(world => world.name === worldName)!.world
  const archetypeCount = world.storage.archetypes.length
  const entityCount = world.storage.archetypes.reduce(
    (sum, archetype) => sum + archetype.entities.length,
    0,
  )

  return (
    <Screen title={`World: ${worldName}`}>
      <h3>Details</h3>
      <dl>
        <dt>Archetypes</dt>
        <dt>{archetypeCount}</dt>
        <dt>Entities</dt>
        <dt>{entityCount}</dt>
      </dl>
      <h3>Actions</h3>
      <ul>
        <li>
          <Link to={`/${worldName}/spawn`}>Spawn</Link>
        </li>
      </ul>
    </Screen>
  )
}
