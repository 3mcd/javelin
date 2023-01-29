import { Entity as JavelinEntity, QuerySelector, type } from "@javelin/ecs"
import * as React from "react"
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect"
import { useApp } from "../../Javelin"

const EntityContext = React.createContext<JavelinEntity>(null as unknown as JavelinEntity)

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
    try {
      const entity = entityRef.current
      if (!entity) {
        entityRef.current = app.world.create(type())
        setUpdate(update + 1)
      }
    } catch (e) {
      console.error(e)
   
    }
    return () => {
      if (entityRef.current) {
        app.world.remove(entityRef.current, type())
      }
    }
  }, [app, entityRef.current, update, selector])


  return <EntityContext.Provider value={entityRef.current}>{children}</EntityContext.Provider>
}

