import { Component as JComponent, ComponentInitValue, Type } from "@javelin/ecs"
import * as React from "react"
import { usePlugin } from "../../hooks/use-plugin/usePlugin"
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect"
import { useApp } from "../../Javelin"
import { mergeRefs } from "../../utils/mergeRefs"
import { useCurrentEntity } from "../entity/Entity"

export interface ComponentProps {
  type: Type
  values?: ComponentInitValue<any>
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
    if (values) {
      app.world.add(entity, type, values)
    }
    return () => {
      app.world.remove(entity, type)
    }
  }, [values])

  if (children && !values) {
    const child = React.Children.only(children) as React.ReactElement
    const mergedRefs = mergeRefs([
      (child as any).ref,
      value => {
        if (!app.world.has(entity, type)) {
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
  ...values: ComponentInitValue<T>
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

export function useCaptureComponent<T>(
  type: Type<[JComponent<T>]>
) {
  const entity = useCurrentEntity()
  const app = useApp()

  useIsomorphicLayoutEffect(() => {
    return () => {
      app.world.remove(entity, type)
    }
  }, [])

  return function captureRefValue(value: T) {
    app.world.add(entity, type, value)
  }
}
