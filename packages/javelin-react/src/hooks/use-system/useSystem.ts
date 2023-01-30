import { Constraints, Predicate, System } from "@javelin/ecs";
import { Maybe } from "@javelin/lib";
import { usePlugin } from "../use-plugin/usePlugin";

export interface UseSystemProps {
  groupId?: string,
  constraint?: Maybe<Constraints<System>>, 
  predicate?: Maybe<Predicate>
}

export function useSystem(system: System, props: UseSystemProps = {}) {
  const { groupId, constraint, predicate } = props
  usePlugin((app) => {
    if (groupId) {
      app.addSystemToGroup(groupId, system, constraint, predicate)
    } else {
      app.addSystem(system, constraint, predicate)
    }
    return () => {
      app.removeSystem(system)
    }
  })
}