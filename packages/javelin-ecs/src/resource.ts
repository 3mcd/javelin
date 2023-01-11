import {Opaque} from "@javelin/lib"

let nextResourceId = 0

export type Resource<T> = Opaque<number, T>

export let resource = <T>() =>
  nextResourceId++ as unknown as Resource<T>
