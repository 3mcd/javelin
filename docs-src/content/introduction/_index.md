+++
title = "Introduction"
weight = 1
sort_by = "weight"
insert_anchor_links = "right"
+++

<canvas id="game" style="cursor: pointer;"></canvas>

Javelin is a suite of packages used to build multiplayer games. The core package is an [Entity-Component System (ECS)](/ecs).

Check out the code at the [GitHub repo](https://github.com/3mcd/javelin) or, move onto the [ECS](/ecs) chapter to start learning how to use Javelin!

<style>
  canvas {
    background: #388282;
    width: 800px;
    height: 300px;
  }
</style>
<script type="text/javascript">
function relMouseCoords(canvas, event) {
  let totalOffsetX = 0
  let totalOffsetY = 0
  let canvasX = 0
  let canvasY = 0

  do {
    totalOffsetX += canvas.offsetLeft - canvas.scrollLeft
    totalOffsetY += canvas.offsetTop - canvas.scrollTop
  } while ((canvas = canvas.offsetParent))

  canvasX = event.pageX - totalOffsetX
  canvasY = event.pageY - totalOffsetY

  return { x: canvasX, y: canvasY }
}

const canvas = document.getElementById("game")
const context = canvas.getContext("2d")

context.imageSmoothingEnabled = false
canvas.width = 800
canvas.height = 300

const Transform = Javelin.createComponentType({
  type: 1,
  schema: {
    x: Javelin.number,
    y: Javelin.number,
  },
  initialize: (t, x = 0, y = 0) => {
    t.x = x
    t.y = y
  },
})
const Velocity = Javelin.createComponentType({
  type: 2,
  schema: {
    x: Javelin.number,
    y: Javelin.number,
  },
  initialize: (v, x = 0, y = 0) => {
    v.x = x
    v.y = y
  },
})
const Junk = Javelin.createComponentType({
  type: 3,
  schema: {
    influenced: Javelin.boolean,
  },
})
const Wormhole = Javelin.createComponentType({
  type: 4,
  schema: {
    r: Javelin.number,
    obliterated: Javelin.boolean,
  },
  initialize: (w, r = 0.5) => {
    w.r = r
    w.obliterated = false
  },
})
const Dragging = Javelin.createComponentType({
  type: 5,
})

const createMouseEventEffect = (name) =>
  Javelin.createEffect(() => {
    const state = { active: false, coords: null }

    canvas.addEventListener(name, event => {
      state.active = true
      state.coords = relMouseCoords(canvas, event)
    })

    return () => {
      if (state.active) {
        const result = { ...state }
        state.active = false
        return result
      }
      return state
    }
  })

const effects = {
  mouseup: createMouseEventEffect("mouseup"),
  mousedown: createMouseEventEffect("mousedown"),
  mousemove: createMouseEventEffect("mousemove"),
}

const wormholes = Javelin.query(Transform, Wormhole, Velocity)
const junk = Javelin.query(Transform, Velocity, Junk)
const dragging = Javelin.query(Transform, Wormhole, Dragging)

function inside(a, b, x, y, r) {
  const dist = (a - x) * (a - x) + (b - y) * (b - y)
  r *= r
  return dist < r
}

const sys_spawn = world => {
  const mouseup = effects.mouseup()
  const mousedown = effects.mousedown()
  const mousemove = effects.mousemove()
  const hasClickedOnce = Javelin.ref(false)
  const shouldSpawnWormhole = Javelin.interval(3500)

  if (mousedown.active) {
    for (const [entities, [wt, w]] of wormholes) {
      for (let i = 0; i < entities.length; i++) {
        const { x, y } = wt[i]
        const { r } = w[i]
        if (inside(mousedown.coords.x, mousedown.coords.y, x, y, r / 10)) {
          world.attach(entities[i], world.component(Dragging))
        }
      }
    }
  }

  if (mouseup.active) {
    let isDragging = false
    for (const [entities] of dragging) {
      if (entities.length > 0) {
        world.detach(entities[0], Dragging)
        isDragging = true
        break
      }
    }
    if (!isDragging) {
      hasClickedOnce.value = true
      spawnWormhole(mouseup.coords.x, mouseup.coords.y, 30)
    }
  }

  if (mousemove.active) {
    dragging.forEach((entity, [t, w]) => {
      t.x = mousemove.coords.x
      t.y = mousemove.coords.y
    })
  }

  if (!hasClickedOnce.value && shouldSpawnWormhole) {
    spawnWormhole(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.max(10, Math.random() * 60),
    )
  }
}

const sys_spawn_junk = () => {
  const shouldSpawnJunk = Javelin.ref(true)

  if (shouldSpawnJunk.value) {
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * (canvas.width * 1.5) - 0.25 * canvas.width
      const y = Math.random() * (canvas.height * 1.5) - 0.25 * canvas.height
      world.spawn(
        world.component(Transform, x, y),
        world.component(Velocity),
        world.component(Junk),
      )
    }

    shouldSpawnJunk.value = false
  }
}

const sys_attract = world => {
  wormholes.forEach((we, [wt, w, wv]) => {
    if (w.obliterated) {
      return
    }
    wv.x *= 0.95
    wv.y *= 0.95
    junk.forEach((je, [jt, jv, j]) => {
      if (we === je) {
        return
      }

      const dx = wt.x - jt.x
      const dy = wt.y - jt.y
      const len = Math.sqrt(dx * dx + dy * dy)

      if (len <= w.r) {
        j.influenced = true

        if (len < w.r / 10) {
          const jw = world.tryGet(je, Wormhole)

          if (jw) {
            jw.obliterated = true
          }

          w.r += jw?.r || 0.1

          world.destroy(je)
        } else {
          jv.x += (dx / len) / 200
          jv.y += (dy / len) / 200
        }
      }
    })
  })
}

const sys_render = world => {
  context.clearRect(0, 0, 800, 300)

  junk.forEach((e, [{ x, y }, t, { influenced }]) => {
    context.fillStyle = influenced ? "#fff" : "#99c7c7"
    context.fillRect(Math.floor(x), Math.floor(y), 1, 1)
  })

  wormholes.forEach((e, [{ x, y }, { r }]) => {
    let maxPos
    let maxLen = Infinity

    wormholes.forEach((e2, [pos2]) => {
      if (e === e2) {
        return
      }

      const { x: x2, y: y2 } = pos2
      const dx = x - x2
      const dy = y - y2
      const len = Math.sqrt(dx * dx + dy * dy)

      if (len < maxLen) {
        maxLen = len
        maxPos = pos2
      }
    })

    if (maxPos) {
      context.strokeStyle = "#99c7c7"
      context.lineWidth = 0.5
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(maxPos.x, maxPos.y)
      context.closePath()
      context.stroke()
    }
  })

  wormholes.forEach((e, [{ x, y }, { r }]) => {
    context.fillStyle = "#fff"
    context.beginPath()
    context.arc(Math.floor(x), Math.floor(y), r / 10, 0, 2 * Math.PI)
    context.fill()
  })
}

const sys_physics = world => {
  junk.forEach((_, [t, { x, y }]) => {
    t.x += x
    t.y += y
  })
}

const sys_log = world => {
  const shouldLog = Javelin.interval(1000)
  const countAttached = Javelin.ref(0)
  const countDetached = Javelin.ref(0)
  const countSpawned = Javelin.ref(0)
  const countDestroyed = Javelin.ref(0)

  Javelin.attached(Transform).forEach(() => countAttached.value++)
  Javelin.detached(Transform).forEach(() => countDetached.value++)
  Javelin.spawned().forEach(() => countSpawned.value++)
  Javelin.destroyed().forEach(() => countDestroyed.value++)

  if (shouldLog) {
    console.log(
      `att=${countAttached.value} det=${countDetached.value} spa=${countSpawned.value} des=${countDestroyed.value}`,
    )
    countAttached.value = 0
    countDetached.value = 0
    countSpawned.value = 0
    countDestroyed.value = 0
  }
}

const world = Javelin.createWorld({
  systems: [
    sys_spawn,
    sys_spawn_junk,
    sys_physics,
    sys_attract,
    sys_render,
    sys_log,
  ],
})

function spawnWormhole(x, y, r) {
  world.spawn(
    world.component(Transform, x, y),
    world.component(Wormhole, r),
    world.component(Velocity),
    world.component(Junk),
  )
}

function loop() {
  world.tick()
  requestAnimationFrame(loop)
}

loop()
</script>
