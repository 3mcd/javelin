import { Entity, QueryTerm, QueryTerms } from "@javelin/ecs";
import { useState } from "react";
import { useSystem } from "../use-system/useSystem";
import { useUpdate } from "../use-update/useUpdate";

// returns an array of entities that match the query terms
export function useEntitiesMonitor(queryTerms: QueryTerms | QueryTerm) {
  const [set] = useState(new Set<Entity>())
  const update = useUpdate()

  function handleIncluded(entity: Entity) {
    set.add(entity)
    update()
  }

  function handleExcluded(entity: Entity) {
    set.delete(entity)
    update()
  }

  useSystem((world) => {
    world
    .monitor(...Array.isArray(queryTerms) ? queryTerms : [queryTerms])
    .eachIncluded(handleIncluded)
    .eachExcluded(handleExcluded)
  })

  return Array.from(set)
}