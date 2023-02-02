import {Component as JComponent, Type} from "@javelin/ecs"
import {ValuesInit} from "@javelin/ecs/src/component"
import * as React from "react"
import {usePlugin} from "../../hooks/use-plugin/usePlugin"
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect"
import {useApp} from "../../Javelin"
import {mergeRefs} from "../../utils/mergeRefs"
import {useCurrentEntity} from "../entity/Entity"

export interface ComponentProps {
  type: Type
  values?: ValuesInit<any>
}

export const Component: React.FC<React.PropsWithChildren<ComponentProps>> = ({
  children,
  type,
  values,
}) => {
  const entity = useCurrentEntity()
  const app = useApp()
  if (!entity) {
    throw new Error("<Component> must be a child of <Entity>")
  }

  useIsomorphicLayoutEffect(() => {
    return () => {
      app.world.remove(entity, type)
    }
  }, [])

  if (children) {
    const child = React.Children.only(children) as React.ReactElement
    const mergedRefs = mergeRefs([
      (child as any).ref,
      value => {
        if (!app.world.has(entity, type)) {
          // TODO fix this
          // @ts-ignore
          app.world.add(entity, type, value)
        }
      },
    ])

    return React.cloneElement(child, {
      ref: mergedRefs,
    })
  }
  return null
}

export function useComponent<T extends JComponent[]>(
  type: Type<T>,
  ...values: ValuesInit<T>
) {
  const entity = useCurrentEntity()

  usePlugin(
    app => {
      app.world.add(entity, type, ...values)
      return () => {
        app.world.remove(entity, type)
      }
    },
    [values],
  )
}
