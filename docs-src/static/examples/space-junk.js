const {
  arrayOf,
  boolean,
  component,
  createEffect,
  createQuery,
  createTopic,
  createWorld,
  each,
  useInterval,
  useMonitor,
  useRef,
  useTimer,
  useTrigger,
  number,
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

const Transform = {
  x: number,
  y: number,
}
const Velocity = {
  x: number,
  y: number,
}
const Junk = {
  influenced: boolean,
  buffer: arrayOf(arrayOf(number)),
}
const Wormhole = {
  r: number,
  obliterated: boolean,
}
const Dragging = {}

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

const useMouseup = createMouseEventEffect("mouseup")
const useMousedown = createMouseEventEffect("mousedown")
const useMousemove = createMouseEventEffect("mousemove")

const log = createTopic()

const transforms = createQuery(Transform)
const wormholes = createQuery(Transform, Wormhole, Velocity)
const junk = createQuery(Transform, Velocity, Junk)
const dragging = createQuery(Transform, Wormhole, Dragging)

function inside(a, b, x, y, r) {
  const dist = (a - x) * (a - x) + (b - y) * (b - y)
  r *= r
  return dist < r
}

const spawn = world => {
  const mouseup = useMouseup()
  const mousedown = useMousedown()
  const mousemove = useMousemove()
  const hasClickedOnce = useRef(false)
  const shouldSpawnWormhole = useInterval(3500)

  if (mousedown.active) {
    for (const [entities, [wt, w]] of wormholes) {
      for (let i = 0; i < entities.length; i++) {
        const { x, y } = wt[i]
        const { r } = w[i]
        if (inside(mousedown.coords.x, mousedown.coords.y, x, y, r / 10)) {
          world.attach(entities[i], component(Dragging))
        }
      }
    }
  }

  if (mouseup.active) {
    let isDragging = false
    for (const [entities] of dragging) {
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
    dragging((entity, [t]) => {
      t.x = mousemove.coords.x
      t.y = mousemove.coords.y
    })
  }

  if (!hasClickedOnce.value && shouldSpawnWormhole) {
    spawnWormhole()
  }
}

const spawnJunk = () => {
  const shouldSpawnJunk = useRef(true)

  if (shouldSpawnJunk.value) {
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * (canvas.width * 1.5) - 0.25 * canvas.width
      const y = Math.random() * (canvas.height * 1.5) - 0.25 * canvas.height
      const t = component(Transform)
      t.x = x
      t.y = y
      world.create(t, component(Velocity), component(Junk))
    }

    shouldSpawnJunk.value = false
  }
}

const attract = world => {
  wormholes((we, [wt, w, wv]) => {
    if (w.obliterated) {
      return
    }
    wv.x *= 0.95
    wv.y *= 0.95
    junk((je, [jt, jv, j]) => {
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

  junk((e, [{ x, y }, , { influenced }]) => {
    context.fillStyle = influenced ? "#fff" : "#99c7c7"
    context.fillRect(Math.floor(x), Math.floor(y), 1, 1)
  })

  wormholes((e, [{ x, y }]) => {
    let maxPos
    let maxLen = Infinity

    wormholes((e2, [pos2]) => {
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

  wormholes((e, [{ x, y }, { r }]) => {
    context.fillStyle = "#fff"
    context.beginPath()
    context.arc(Math.floor(x), Math.floor(y), r / 10, 0, 2 * Math.PI)
    context.fill()
  })
}

const physics = () =>
  junk((e, [t, v, j]) => {
    t.x += v.x
    t.y += v.y
  })

const trigger = () => {
  const shouldLog = useInterval(1000)
  const countAttach = useRef(0)
  const countDetach = useRef(0)

  useMonitor(
    transforms,
    () => countAttach.value++,
    () => countDetach.value++,
  )

  if (shouldLog) {
    log.pushImmediate(`(t) +${countAttach.value} -${countDetach.value}`)
    countAttach.value = 0
    countDetach.value = 0
  }
}

const monitor = () => {
  const shouldLog = useInterval(1000)
  const countInsert = useRef(0)
  const countRemove = useRef(0)

  useMonitor(
    wormholes,
    () => countInsert.value++,
    () => countRemove.value++,
  )

  useMonitor(
    dragging,
    (e, c) => console.log(e, "started dragging", c[0], c[1], c[2]),
    (e, c) => console.log(e, "stopped dragging", c[0], c[1], c[2]),
  )

  if (shouldLog) {
    log.pushImmediate(`(w) +${countInsert.value} -${countRemove.value}`)
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

const logs = () => {
  const messages = []
  for (const message of log) {
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
  systems: [spawn, spawnJunk, physics, attract, render, trigger, monitor, logs],
  topics: [log],
})

function spawnWormhole(
  x = Math.random() * canvas.width,
  y = Math.random() * canvas.height,
  r = Math.max(10, Math.random() * 60),
) {
  const t = component(Transform)
  const w = component(Wormhole)
  t.x = x
  t.y = y
  w.r = r
  world.create(t, w, component(Velocity), component(Junk))
}

spawnWormhole()

function loop() {
  world.step()
  requestAnimationFrame(loop)
}

loop()
