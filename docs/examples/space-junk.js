const {
  boolean,
  createComponentType,
  createEffect,
  createTopic,
  createWorld,
  interval,
  number,
  onAttach,
  onDetach,
  onInsert,
  onRemove,
  query,
  ref,
  timer,
} = Javelin

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

const Transform = createComponentType({
  type: 1,
  schema: {
    x: number,
    y: number,
  },
  initialize: (t, x = 0, y = 0) => {
    t.x = x
    t.y = y
  },
})
const Velocity = createComponentType({
  type: 2,
  schema: {
    x: number,
    y: number,
  },
  initialize: (v, x = 0, y = 0) => {
    v.x = x
    v.y = y
  },
})
const Junk = createComponentType({
  type: 3,
  schema: {
    influenced: boolean,
  },
})
const Wormhole = createComponentType({
  type: 4,
  schema: {
    r: number,
    obliterated: boolean,
  },
  initialize: (w, r = 0.5) => {
    w.r = r
    w.obliterated = false
  },
})
const Dragging = createComponentType({
  type: 5,
})

const createMouseEventEffect = name =>
  createEffect(() => {
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

const topics = {
  log: createTopic(),
}

const queries = {
  wormholes: createQuery(Transform, Wormhole, Velocity),
  junk: createQuery(Transform, Velocity, Junk),
  dragging: createQuery(Transform, Wormhole, Dragging),
}

function inside(a, b, x, y, r) {
  const dist = (a - x) * (a - x) + (b - y) * (b - y)
  r *= r
  return dist < r
}

const spawn = world => {
  const mouseup = effects.mouseup()
  const mousedown = effects.mousedown()
  const mousemove = effects.mousemove()
  const hasClickedOnce = ref(false)
  const shouldSpawnWormhole = interval(3500)

  if (mousedown.active) {
    for (const [entities, [wt, w]] of queries.wormholes) {
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
    for (const [entities] of queries.dragging) {
      for (let i = 0; i < entities.length; i++) {
        world.detach(entities[i], Dragging)
        isDragging = true
      }
    }
    if (!isDragging) {
      hasClickedOnce.value = true
      spawnWormhole(mouseup.coords.x, mouseup.coords.y, 30)
    }
  }

  if (mousemove.active) {
    queries.dragging.forEach((entity, [t, w]) => {
      t.x = mousemove.coords.x
      t.y = mousemove.coords.y
    })
  }

  if (!hasClickedOnce.value && shouldSpawnWormhole) {
    spawnWormhole()
  }
}

const spawnJunk = () => {
  const shouldSpawnJunk = ref(true)

  if (shouldSpawnJunk.value) {
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * (canvas.width * 1.5) - 0.25 * canvas.width
      const y = Math.random() * (canvas.height * 1.5) - 0.25 * canvas.height
      world.create(
        world.component(Transform, x, y),
        world.component(Velocity),
        world.component(Junk),
      )
    }

    shouldSpawnJunk.value = false
  }
}

const attract = world => {
  queries.wormholes.forEach((we, [wt, w, wv]) => {
    if (w.obliterated) {
      return
    }
    wv.x *= 0.95
    wv.y *= 0.95
    queries.junk.forEach((je, [jt, jv, j]) => {
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
          jv.x += dx / len / 200
          jv.y += dy / len / 200
        }
      }
    })
  })
}

const render = () => {
  context.clearRect(0, 0, 800, 300)

  queries.junk.forEach((e, [{ x, y }, t, { influenced }]) => {
    context.fillStyle = influenced ? "#fff" : "#99c7c7"
    context.fillRect(Math.floor(x), Math.floor(y), 1, 1)
  })

  queries.wormholes.forEach((e, [{ x, y }, { r }]) => {
    let maxPos
    let maxLen = Infinity

    queries.wormholes.forEach((e2, [pos2]) => {
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

  queries.wormholes.forEach((e, [{ x, y }, { r }]) => {
    context.fillStyle = "#fff"
    context.beginPath()
    context.arc(Math.floor(x), Math.floor(y), r / 10, 0, 2 * Math.PI)
    context.fill()
  })
}

const physics = () => {
  queries.junk.forEach((_, [t, { x, y }]) => {
    t.x += x
    t.y += y
  })
}

const triggers = () => {
  const shouldLog = interval(1000)
  const countAttach = ref(0)
  const countDetach = ref(0)

  for (const [] of onAttach(Transform)) {
    countAttach.value++
  }

  onDetach(Transform).forEach(() => countDetach.value++)

  if (shouldLog) {
    topics.log.pushImmediate(`(t) +${countAttach.value} -${countDetach.value}`)
    countAttach.value = 0
    countDetach.value = 0
  }
}

const monitors = () => {
  const shouldLog = interval(1000)
  const countInsert = ref(0)
  const countRemove = ref(0)

  onInsert(queries.wormholes).forEach(() => countInsert.value++)
  onRemove(queries.wormholes).forEach(() => countRemove.value++)

  if (shouldLog) {
    topics.log.pushImmediate(`(w) +${countInsert.value} -${countRemove.value}`)
    countInsert.value = 0
    countRemove.value = 0
  }
}

const rightPad = (str, n) => {
  let out = str
  for (let i = str.length - 1; i < n; i++) {
    out += " "
  }
  return out
}

const log = () => {
  const messages = []
  for (const message of topics.log) {
    messages.push(message)
  }
  if (messages.length > 0) {
    console.log(
      messages.reduce(
        (final, message) => `${final} ${rightPad(message, 12)}`,
        "",
      ),
    )
  }
}

const world = createWorld({
  systems: [
    spawn,
    spawnJunk,
    physics,
    attract,
    render,
    triggers,
    monitors,
    log,
  ],
  topics: [topics.log],
})

function spawnWormhole(
  x = Math.random() * canvas.width,
  y = Math.random() * canvas.height,
  r = Math.max(10, Math.random() * 60),
) {
  world.create(
    world.component(Transform, x, y),
    world.component(Wormhole, r),
    world.component(Velocity),
    world.component(Junk),
  )
}

spawnWormhole()

function loop() {
  world.step()
  requestAnimationFrame(loop)
}

loop()
