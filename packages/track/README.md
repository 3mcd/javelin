# `@javelin/track`

Track changes made to Javelin components.

## Docs

https://javelin.games/ecs/change-detection/

## API Example

```ts
import * as Track from "@javelin/track"
// ...
const p1 = component(Position)
const p2 = component(Position)
const changes = component(Track.ChangeSet)
// update p1 and write to ChangeSet
Track.set(p1, changes, "x", 123)
// apply changes to p2
Track.apply(changes, p2)
p2.x // 123
```
