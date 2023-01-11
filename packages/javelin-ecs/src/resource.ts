import {Opaque} from "@javelin/lib"

let next_resource_id = 0

export type Resource<T> = Opaque<number, T>

export let resource = <T>() =>
  next_resource_id++ as unknown as Resource<T>
