import {
  App,
  ChildOf,
  component,
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
import {Health, prune_dead_system} from "./health.js"
import {box_intersects} from "./math.js"
import {Player, PLAYER_MAX_HEALTH} from "./player.js"
import {Position} from "./position.js"

export let IsLoot = tag()
export let LootBag = type(IsLoot, Position, Box, DisposeTimer)

export let Quiver = component("f32")
export let HealthPotion = component("f32")

let make_loot = (world: World, x: number, y: number) =>
  world.create(
    LootBag,
    {x, y},
    {x: 1, y: 1},
    world.get_resource(Clock).time + 10,
  )

let drop_loot_system = (world: World) =>
  world.monitor_immediate(Enemy).each_excluded(enemy => {
    if (Math.random() > 0.2) {
      let {x, y} = world.get(enemy, Position)
      let loot = make_loot(world, x, y)
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

let pick_up_loot_system = (world: World) =>
  world
    .of(Player)
    .as(Position, Box, Health, Quiver, Aura)
    .each(
      (
        player,
        player_pos,
        player_box,
        player_health,
        player_quiver,
        player_aura,
      ) =>
        world.of(LootBag).each((loot_bag, loot_pos, loot_box) => {
          if (
            box_intersects(player_pos, player_box, loot_pos, loot_box)
          ) {
            world
              .of(ChildOf(loot_bag), HealthPotion)
              .each((_, health_potion) => {
                let next_player_health = Math.min(
                  player_health + health_potion,
                  PLAYER_MAX_HEALTH,
                )
                world.set(player, Health, next_player_health)
              })
            world.of(ChildOf(loot_bag), Quiver).each((_, quiver) => {
              world.set(player, Quiver, player_quiver + quiver)
            })
            world.set(player, Aura, player_aura + 1)
            world.delete(loot_bag)
          }
        }),
    )

export let loot_plugin = (app: App) =>
  app
    .add_system_to_group(Group.LateUpdate, drop_loot_system, _ =>
      _.after(prune_dead_system),
    )
    .add_system_to_group(Group.LateUpdate, pick_up_loot_system, _ =>
      _.after(drop_loot_system),
    )
