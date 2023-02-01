import { Resource } from "@javelin/ecs/src/resource";
import { useState } from 'react';
import { usePlugin } from "../use-plugin/usePlugin";


export function useResource<T>(resource: Resource<T>, value: T) {
  usePlugin((app) => {
    app.addResource(resource, value)
    return () => {
      app.addResource(resource, undefined)
    }
  },[value])
}

export function useResourceRef<T>(resource: Resource<T>) {
  const [refValue, setRefValue] = useState<T>()
  
  usePlugin((app) => {
    if (!refValue) {
      return;
    }
    app.addResource(resource, refValue)
    return () => {
      app.addResource(resource, undefined)
    }
  },[refValue])

  return (refValue: T) => {
    setRefValue(refValue)
  };
}