import * as j from "@javelin/ecs"
import {Aura} from "./aura.js"
import {Box} from "./box.js"
import {DisposeTimer} from "./dispose.js"
import {Enemy} from "./enemy.js"
import {Health, pruneDeadSystem} from "./health.js"
import {boxIntersects} from "./math.js"
import {Player, PLAYER_MAX_HEALTH} from "./player.js"
import {Position} from "./position.js"

export let IsLoot = j.tag()
export let LootBag = j.type(IsLoot, Position, Box, DisposeTimer)

export let Quiver = j.value("f32")
export let HealthPotion = j.value("f32")

let makeLoot = (world: j.World, x: number, y: number) =>
  world.create(
    LootBag,
    {x, y},
    {x: 1, y: 1},
    world.getResource(j.FixedTime).currentTime + 10,
  )

let dropLootSystem = (world: j.World) =>
  world.monitorImmediate(Enemy).eachExcluded(enemy => {
    if (Math.random() > 0.2) {
      let {x, y} = world.get(enemy, Position)!
      let loot = makeLoot(world, x, y)
      world.create(
        j.type(j.ChildOf(loot), HealthPotion),
        Math.ceil(Math.random() * 3),
      )
      world.create(
        j.type(j.ChildOf(loot), Quiver),
        Math.ceil(Math.random() * 10),
      )
    }
  })

let pickUpLootSystem = (world: j.World) =>
  world
    .query(Player)
    .as(Position, Box, Health, Quiver, Aura)
    .each(
      (player, playerPos, playerBox, playerHealth, playerQuiver, playerAura) =>
        world.query(LootBag).each((lootBag, lootPos, lootBox) => {
          if (boxIntersects(playerPos, playerBox, lootPos, lootBox)) {
            world
              .query(j.ChildOf(lootBag), HealthPotion)
              .each((_, healthPotion) => {
                let nextPlayerHealth = Math.min(
                  playerHealth + healthPotion,
                  PLAYER_MAX_HEALTH,
                )
                world.set(player, Health, nextPlayerHealth)
              })
            world.query(j.ChildOf(lootBag), Quiver).each((_, quiver) => {
              world.set(player, Quiver, playerQuiver + quiver)
            })
            world.set(player, Aura, playerAura + 1)
            world.delete(lootBag)
          }
        }),
    )

export let lootPlugin = (app: j.App) =>
  app
    .addSystemToGroup(
      j.FixedGroup.LateUpdate,
      dropLootSystem,
      j.after(pruneDeadSystem),
    )
    .addSystemToGroup(
      j.FixedGroup.LateUpdate,
      pickUpLootSystem,
      j.after(dropLootSystem),
    )
