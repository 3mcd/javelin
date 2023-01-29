import { Entity as JavelinEntity, QuerySelector, type } from "@javelin/ecs"
import { QueryTerms } from "@javelin/ecs/src/type"
import * as React from "react"
import { useEntitiesMonitor } from "../../hooks/use-monitor/useMonitor"
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect"
import { useApp } from "../../Javelin"

const EntityContext = React.createContext<JavelinEntity>(null as unknown as JavelinEntity)

export const useCurrentEntity = () => React.useContext(EntityContext)

export interface EntityProps {
  entity?: JavelinEntity,
  selector?: QuerySelector
}

export const Entity: React.FC<React.PropsWithChildren<EntityProps>> = ({ children, entity, selector }) => {
  const [update, setUpdate] = React.useState(0)
  const entityRef = React.useRef<JavelinEntity>(entity!)

  const app = useApp()

  useIsomorphicLayoutEffect(() => {
    if (!app) { return }
    const entity = entityRef.current
    if (!entity) {
      entityRef.current = app.world.create(type())
      setUpdate(update + 1)
    }
    return () => {
      if (entityRef.current) {
        app.world.remove(entityRef.current, type())
      }
    }
  }, [app, entityRef.current, update, selector])


  return <EntityContext.Provider value={entityRef.current}>{children}</EntityContext.Provider>
}

export const Entities: React.FC<React.PropsWithChildren<{ query: QueryTerms }>> = ({ children, query }) => {
  const entities = useEntitiesMonitor(query)

  return (
    <>
      {entities.map((entity, i) => (
        <Entity key={i} entity={entity}>
          {children}
        </Entity>
      ))}
    </>
  )
}