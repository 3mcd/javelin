import {
  App,
  ChildOf,
  value,
  Group,
  tag,
  type,
  World,
} from "@javelin/ecs"
import {Aura} from "./aura.js"
import {Box} from "./box.js"
import {Clock} from "./clock.js"
import {DisposeTimer} from "./dispose.js"
import {Enemy} from "./enemy.js"
import {Health, pruneDeadSystem} from "./health.js"
import {boxIntersects} from "./math.js"
import {Player, PLAYER_MAX_HEALTH} from "./player.js"
import {Position} from "./position.js"

export let IsLoot = tag()
export let LootBag = type(IsLoot, Position, Box, DisposeTimer)

export let Quiver = value("f32")
export let HealthPotion = value("f32")

let makeLoot = (world: World, x: number, y: number) =>
  world.create(
    LootBag,
    {x, y},
    {x: 1, y: 1},
    world.getResource(Clock).time + 10,
  )

let dropLootSystem = (world: World) =>
  world.monitorImmediate(Enemy).eachExcluded(enemy => {
    if (Math.random() > 0.2) {
      let {x, y} = world.get(enemy, Position)
      let loot = makeLoot(world, x, y)
      world.create(
        type(ChildOf(loot), HealthPotion),
        Math.ceil(Math.random() * 3),
      )
      world.create(
        type(ChildOf(loot), Quiver),
        Math.ceil(Math.random() * 10),
      )
    }
  })

let pickUpLootSystem = (world: World) =>
  world
    .of(Player)
    .as(Position, Box, Health, Quiver, Aura)
    .each(
      (
        player,
        playerPos,
        playerBox,
        playerHealth,
        playerQuiver,
        playerAura,
      ) =>
        world.of(LootBag).each((lootBag, lootPos, lootBox) => {
          if (boxIntersects(playerPos, playerBox, lootPos, lootBox)) {
            world
              .of(ChildOf(lootBag), HealthPotion)
              .each((_, healthPotion) => {
                let nextPlayerHealth = Math.min(
                  playerHealth + healthPotion,
                  PLAYER_MAX_HEALTH,
                )
                world.set(player, Health, nextPlayerHealth)
              })
            world.of(ChildOf(lootBag), Quiver).each((_, quiver) => {
              world.set(player, Quiver, playerQuiver + quiver)
            })
            world.set(player, Aura, playerAura + 1)
            world.delete(lootBag)
          }
        }),
    )

export let lootPlugin = (app: App) =>
  app
    .addSystemToGroup(Group.LateUpdate, dropLootSystem, _ =>
      _.after(pruneDeadSystem),
    )
    .addSystemToGroup(Group.LateUpdate, pickUpLootSystem, _ =>
      _.after(dropLootSystem),
    )
