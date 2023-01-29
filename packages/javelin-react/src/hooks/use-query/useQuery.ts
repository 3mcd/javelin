import { QuerySelector } from "@javelin/ecs";
import { Constraints, Predicate } from "@javelin/ecs/src/schedule";
import { SystemImpl } from "@javelin/ecs/src/system";
import { Maybe } from "@javelin/lib";
import { useSystem } from "../use-system/useSystem";

export interface UseSystemProps {
  groupId?: string,
  constrain?: Maybe<Constraints<SystemImpl>>, 
  predicate?: Maybe<Predicate>
}

// TODO
export function useQuery(query: QuerySelector){
  useSystem((world) => {
    return world.of(query).each((t) => {

    })
  })
}