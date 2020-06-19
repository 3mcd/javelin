import React from "react"
import { Link, useParams } from "react-router-dom"
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
    <div>
      <h4>Details</h4>
      <dl>
        <dt>Archetypes</dt>
        <dd>{archetypeCount}</dd>
        <dt>Entities</dt>
        <dd>{entityCount}</dd>
      </dl>
      <h4>Actions</h4>
      <ul>
        <li>
          <Link to={`/${worldName}/spawn`}>Spawn</Link>
        </li>
      </ul>
    </div>
  )
}
