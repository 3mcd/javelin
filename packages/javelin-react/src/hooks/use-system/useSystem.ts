import { Constrain } from "@javelin/ecs";
import { Predicate } from "@javelin/ecs/src/schedule";
import { SystemImpl } from "@javelin/ecs/src/system";
import { Maybe } from "@javelin/lib";
import { usePlugin } from "../use-plugin/usePlugin";

export interface UseSystemProps {
  groupId?: string,
  constrain?: Maybe<Constrain<SystemImpl>>, 
  predicate?: Maybe<Predicate>
}

export function useSystem(system: SystemImpl, props: UseSystemProps = {}) {
  const { groupId, constrain, predicate } = props
  usePlugin((app) => {
    if (groupId) {
      app.addSystemToGroup(groupId, system, constrain, predicate)
    } else {
      app.addSystem(system, constrain, predicate)
    }
  }, (app) => {
    // TODO
    // app.removeSystem(system)
  })
}