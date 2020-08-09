+++
title = "Examples"
weight = 5
sort_by = "weight"
insert_anchor_links = "right"
+++

The following is a very simple example of a simulation with naive 2d "physics". The source is around 100 lines of code and is inspectable on this page.

Click anywhere below to make wormholes that absorb space junk:

<canvas id="game" style="cursor: pointer;"></canvas>

### More Examples

- [Networking Example](https://github.com/3mcd/javelin/tree/master/examples/networking)
- [Javelin FPS](http://fps.javelin.games/)

<style>
  canvas {
    background: #fff;
    width: 800px;
    height: 300px;
  }
</style>
<script type="text/javascript">
  function relMouseCoords(event){
      var totalOffsetX = 0;
      var totalOffsetY = 0;
      var canvasX = 0;
      var canvasY = 0;
      var currentElement = this;

      do{
          totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
          totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
      }
      while(currentElement = currentElement.offsetParent)

      canvasX = event.pageX - totalOffsetX;
      canvasY = event.pageY - totalOffsetY;

      return {x:canvasX, y:canvasY}
  }

  HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

  const canvas = document.getElementById("game")
  const context = canvas.getContext("2d", { alpha: false })
  
  context.imageSmoothingEnabled = false
  canvas.width = 800
  canvas.height = 300

  const Transform = Javelin.createComponentType(
    {
      type: 1,
      schema: {
        x: Javelin.number,
        y: Javelin.number,
      },
      initialize: (t, x = 0, y = 0) => {
        t.x = x
        t.y = y
      },
    },
  )
  const Velocity = Javelin.createComponentType(
    {
      type: 2,
      schema: {
        x: Javelin.number,
        y: Javelin.number,
      },
      initialize: (v, x = 0, y = 0) => {
        v.x = x
        v.y = y 
      },
    },
  )
  const Wormhole = Javelin.createComponentType(
    {
      type: 3,
      schema: {
        r: Javelin.number,
      },
      initialize: (w, r = 0.5) => {
        w.r = r
      },
    },
  )

  const Tags = {
    Influenced: 2 ** 0,
  }
  const wormholes = Javelin.query(Transform, Wormhole, Velocity)
  const junk = Javelin.query(Transform, Velocity)

  const attract = world => {
    for (let [we, [wt, w, wv]] of wormholes(world)) {
      wv.x *= 0.95
      wv.y *= 0.95

      for (let [je, [jt, jv]] of junk(world)) {
        if (we === je) {
          continue
        }

        const dx = wt.x - jt.x
        const dy = wt.y - jt.y
        const len = Math.sqrt(dx * dx + dy * dy)

        if (len <= w.r) {
          world.addTag(je, Tags.Influenced)

          if (len < w.r / 10) {
            world.mut(w).r += world.tryGetComponent(je, Wormhole)?.r || 0.1
            world.destroy(je)
          } else {
            const nx = dx / len
            const ny = dy / len
            const mv = world.mut(jv)

            mv.x += nx / 20
            mv.y += ny / 20
          }
        }
      }
    }
  }

  const colorInfluenced = "#222"
  const colorUninfluenced = "#777"

  const render = world => {
    context.clearRect(0, 0, 800, 300)

    for (const [e, [{x, y}]] of junk(world)) {
      context.fillStyle = world.hasTag(e, Tags.Influenced)
        ? colorInfluenced
        : colorUninfluenced
      context.fillRect(Math.floor(x), Math.floor(y), 1, 1)
    }

    for (const [, [{ x, y }, { r }]] of wormholes(world)) {
      context.fillStyle = colorInfluenced
      context.beginPath()
      context.arc(Math.floor(x), Math.floor(y), r / 10, 0, 2 * Math.PI)
      context.fill()
    }
  }

  const physics = world => {
    for (const [, [t, { x, y }]] of junk(world)) {
      const mt = world.mut(t)
      mt.x += x
      mt.y += y
    }
  }

  const world = Javelin.createWorld({
    systems: [physics, attract, render],
    componentTypes: [Transform, Velocity, Wormhole],
  })
  const junkCount = 10000

  for (let i = 0; i < junkCount; i++) {
    world.spawn(
      world.component(Transform, Math.random() * 800, Math.random() * 300),
      world.component(Velocity),
    )
  }

  let initialized = false

  canvas.addEventListener("mouseup", onMouseUp)

  function onMouseUp(event) {
    const { x, y } = canvas.relMouseCoords(event)
    const r = 30

    world.spawn(
      world.component(Transform, x, y),
      world.component(Wormhole, r),
      world.component(Velocity),
    )

    if (!initialized) {
      loop()
      initialized = true
    }
  }

  function loop() {
    world.tick()
    requestAnimationFrame(loop)
  }

  world.tick()
</script>
