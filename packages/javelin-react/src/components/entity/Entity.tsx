import {
  Entity as JavelinEntity,
  QueryTerm,
  QueryTerms,
  type,
} from "@javelin/ecs"
import * as React from "react"
import { useApp } from "../../Javelin"
import { useEntitiesMonitor } from "../../hooks/use-monitor/useMonitor"
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect"

const EntityContext = React.createContext<JavelinEntity>(
  null as unknown as JavelinEntity,
)

export const useCurrentEntity = () => React.useContext(EntityContext)

export interface EntityProps {
  entity?: JavelinEntity
}

export const Entity: React.FC<React.PropsWithChildren<EntityProps>> = ({
  entity: userProvidedEntity,
  children,
}) => {
  const app = useApp()

  const entityRef = React.useRef<JavelinEntity>(null!)
  if (entityRef.current === null) {
    if (typeof userProvidedEntity === "number") {
      entityRef.current = userProvidedEntity
    } else {
      entityRef.current = app.world.create()
    }
  }

  useIsomorphicLayoutEffect(() => {
    return () => {
      app.world.remove(entityRef.current, type())
    }
  }, [userProvidedEntity])

  return (
    <EntityContext.Provider value={entityRef.current}>
      {children}
    </EntityContext.Provider>
  )
}

export const Entities: React.FC<
  React.PropsWithChildren<{query: QueryTerms | QueryTerm}>
> = ({children, query}) => {
  const entities = useEntitiesMonitor(query)

  return (
    <>
      {entities.map(entity => (
        <Entity key={entity} entity={entity}>
          {children}
        </Entity>
      ))}
    </>
  )
}
