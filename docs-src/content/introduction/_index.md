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
  let totalOffsetX = 0;
  let totalOffsetY = 0;
  let canvasX = 0;
  let canvasY = 0;

  do {
    totalOffsetX += canvas.offsetLeft - canvas.scrollLeft;
    totalOffsetY += canvas.offsetTop - canvas.scrollTop;
  } while ((canvas = canvas.offsetParent));

  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  return { x: canvasX, y: canvasY };
}

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

context.imageSmoothingEnabled = false;
canvas.width = 800;
canvas.height = 300;

const Transform = Javelin.createComponentType({
  type: 1,
  schema: {
    x: Javelin.number,
    y: Javelin.number,
  },
  initialize: (t, x = 0, y = 0) => {
    t.x = x;
    t.y = y;
  },
});
const Velocity = Javelin.createComponentType({
  type: 2,
  schema: {
    x: Javelin.number,
    y: Javelin.number,
  },
  initialize: (v, x = 0, y = 0) => {
    v.x = x;
    v.y = y;
  },
});
const Junk = Javelin.createComponentType({
  type: 3,
  schema: {
    influenced: Javelin.boolean,
  },
});
const Wormhole = Javelin.createComponentType({
  type: 4,
  schema: {
    r: Javelin.number,
    obliterated: Javelin.boolean,
  },
  initialize: (w, r = 0.5) => {
    w.r = r;
    w.obliterated = false
  },
});

const effects = {
  interval: Javelin.createEffect(() => {
    let state = 0
    return (t) => {
      if (state === 1) {
        return false
      }
      state = 1
      setTimeout(() => (state = 0), t)
      return true
    }
  }),
  click: Javelin.createEffect(() => {
    const state = { clicked: false, coords: null }

    canvas.addEventListener("click", event => {
      state.clicked = true
      state.coords = relMouseCoords(canvas, event)
    })

    return () => {
      if (state.clicked) {
        const result = {...state}
        state.clicked = false
        return result
      }
      return state
    }
  }),
  ref: Javelin.createEffect(() => {
    let initial = true
    const state = {}
    return (initialValue) => {
      if (initial) {
        state.value = initialValue
      }
      initial = false
      return state
    }
  })
}

const wormholes = Javelin.query(Transform, Wormhole, Velocity);
const junk = Javelin.query(Transform, Velocity, Junk);

const sys_spawn = world => {
  const { clicked, coords } = effects.click()
  const hasClickedOnce = effects.ref(false)
  const shouldSpawnJunk = effects.ref(true)
  const shouldSpawnWormhole = effects.interval(3500)

  if (shouldSpawnJunk.value) {
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * (canvas.width * 1.5) - 0.25 * canvas.width
      const y = Math.random() * (canvas.height * 1.5) - 0.25 * canvas.height
      world.spawn(
        world.component(Transform, x, y),
        world.component(Velocity),
        world.component(Junk)
      );
    }

    shouldSpawnJunk.value = false;
  }

  if (clicked) {
    hasClickedOnce.value = true
    spawnWormhole(
      coords.x,
      coords.y,
      30,
    )
  }

  if (!hasClickedOnce.value && shouldSpawnWormhole) {
    spawnWormhole(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.max(10, Math.random() * 60)
    )
  }
}

const sys_attract = (world) => {
  wormholes.forEach((we, [wt, w, wv]) => {
    if (w.obliterated) {
      return
    }
    wv.x *= 0.95;
    wv.y *= 0.95;
    junk.forEach((je, [jt, jv, j]) => {
      if (we === je) {
        return;
      }

      const dx = wt.x - jt.x;
      const dy = wt.y - jt.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len <= w.r) {
        j.influenced = true;

        if (len < w.r / 10) {
          const jw = world.tryGet(je, Wormhole)

          if (jw) {
            jw.obliterated = true;
          }

          w.r += jw?.r || 0.1;

          world.destroy(je);
        } else {
          const nx = dx / len;
          const ny = dy / len;

          jv.x += nx / 200;
          jv.y += ny / 200;
        }
      }
    })
  })
};

const colorInfluenced = "#fff";
const colorUninfluenced = "#99c7c7";

const sys_render = (world) => {
  context.clearRect(0, 0, 800, 300);

  junk.forEach((e, [{ x, y }, t, { influenced }]) => {
    context.fillStyle = influenced ? colorInfluenced : colorUninfluenced;
    context.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  })

  wormholes.forEach((e, [{x, y}, {r}]) => {
    let maxPos;
    let maxLen = Infinity;

    wormholes.forEach((e2, [pos2]) => {
      if (e === e2) {
        return;
      }

      const {x: x2, y: y2} = pos2;
      const dx = x - x2;
      const dy = y - y2;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < maxLen) {
        maxLen = len;
        maxPos = pos2;
      }

    })

    if (maxPos) {
      context.strokeStyle = "#99c7c7";
      context.lineWidth = 0.5;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(maxPos.x, maxPos.y);
      context.closePath();
      context.stroke();
    }
  })

  wormholes.forEach((e, [{ x, y }, { r }]) => {
    context.fillStyle = colorInfluenced;
    context.beginPath();
    context.arc(Math.floor(x), Math.floor(y), r / 10, 0, 2 * Math.PI);
    context.fill();
  })
};

const sys_physics = (world) => {
  junk.forEach((_, [t, { x, y }]) => {
    t.x += x;
    t.y += y;
  })
};

const sys_log = (world) => {
  const shouldLog = Javelin.interval(1000)
  const countAttached = Javelin.ref(0)
  const countDetached = Javelin.ref(0)
  const { length: lengthAttached } = Javelin.attached(Transform)
  const { length: lengthDetached } = Javelin.detached(Transform)

  countAttached.value += lengthAttached
  countDetached.value += lengthDetached

  if (shouldLog) {
    console.log(`attached=${countAttached.value} detached=${countDetached.value}`)
    countAttached.value = 0
    countDetached.value = 0
  }
}

const world = Javelin.createWorld({
  systems: [
    sys_spawn,
    sys_physics,
    sys_attract,
    sys_render,
    sys_log,
  ],
});

function spawnWormhole(x, y, r) {
  world.spawn(
    world.component(Transform, x, y),
    world.component(Wormhole, r),
    world.component(Velocity),
    world.component(Junk)
  );
}

function loop() {
  world.tick();
  requestAnimationFrame(loop);
}

loop()
</script>
