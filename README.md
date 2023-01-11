# Javelin

## Development

Install dependencies

```sh
pnpm i
```

Run the example

```ts
pnpx vite
```

## Getting Started

```ts
import {app, component, type} from "@javelin/ecs"

type Vector2 = {x: number; y: number}
let Position = component<Vector2>()
let Velocity = component<Vector2>()
let Body = type(Position, Velocity)

let game = app()
  .add_init_system(world => {
    let p = {x: 0, y: 0}
    let v = {x: 1, y: 1}
    world.create(Body, p, v)
  })
  .add_system(world => {
    world.of(Body).each((e, p, v) => {
      p.x += v.x
      p.y += v.y
    })
  })

setInterval(() => app.step(), (1 / 60) * 1_000)
```

### Schemas

```ts
let Position = component({x: "f32", y: "f32"})
let Health = "u32"
// create an entity with position {x: 0, y: 0} and mass 0
world.create(type(Position, Mass))
```

### Relationships

Parent/child hierarchies

```ts
let parent = world.create()
let child = world.create(ChildOf(parent))
world.parent_of(child) // -> `parent`
world.delete(parent) // also deletes `child`
```

Custom relationships

```ts
let DockedTo = relation()

let docking_system = (world: World) => {
  let ships = world.of(Ship, Not(DockedTo))
  let stations = world.of(Station)
  ships.each((ship, ship_transform) => {
    stations.each((station, station_transform) => {
      if (should_dock(station_transform, ship_transform)) {
        world.add(ship, DockedTo(station))
      }
    })
  })
}

let render_docked_system = (world: World) => {
  let stations = world.query(Station)
  stations.each(station => {
    world.query(Ship, DockedTo(station)).each(docked_ship => {
      // draw list item
    })
  })
}
```

### Enums

```ts
let Bat = tag()
let Rat = tag()
let EnemyType = slot(Bat, Rat)
let Enemy = type(Health)

let BatEnemy = type(Enemy, EnemyType(Bat))

world.create(BatEnemy)
world.of(BatEnemy).each(() => {
  // do stuff with bat enemies
})

// throws error "A type can have at most one component for a given slot"
world.create(type(EnemyType(Bat), EnemyType(Rat)))
// throws error "A slot only accepts components defined in its enum"
world.create(type(EnemyType(Merchant)))
```
