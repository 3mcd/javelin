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
    background: #fff;
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
  },
  initialize: (w, r = 0.5) => {
    w.r = r;
  },
});

const wormholes = Javelin.query(Transform, Wormhole, Velocity);
const junk = Javelin.query(Transform, Velocity, Junk);

const attract = (world) => {
  for (let [we, [wt, w, wv]] of wormholes(world)) {
    wv.x *= 0.95;
    wv.y *= 0.95;

    for (let [je, [jt, jv, j]] of junk(world)) {
      if (we === je) {
        continue;
      }

      const dx = wt.x - jt.x;
      const dy = wt.y - jt.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len <= w.r) {
        j.influenced = true;

        if (len < w.r / 10) {
          w.r += world.tryGetComponent(je, Wormhole)?.r || 0.1;
          world.destroy(je);
        } else {
          const nx = dx / len;
          const ny = dy / len;

          jv.x += nx / 200;
          jv.y += ny / 200;
        }
      }
    }
  }
};

const colorInfluenced = "#388282";
const colorUninfluenced = "#aaa";

const render = (world) => {
  context.clearRect(0, 0, 800, 300);

  for (const [e, [{ x, y }, , { influenced }]] of junk(world)) {
    context.fillStyle = influenced ? colorInfluenced : colorUninfluenced;
    context.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }

  for (const [e, [{ x, y }, { r }]] of wormholes(world)) {    
    let maxPos;
    let maxLen = Infinity;

    for (const [e2, [pos2]] of wormholes(world)) {
      if (e === e2) {
        continue;
      }

      const {x: x2, y: y2} = pos2;
      const dx = x - x2;
      const dy = y - y2;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < maxLen) {
        maxLen = len;
        maxPos = pos2;
      }
    }

    if (maxPos) {
      context.strokeStyle = "#99c7c7";
      context.lineWidth = 0.5;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(maxPos.x, maxPos.y);
      context.closePath();
      context.stroke();
    }
  }

  for (const [e, [{ x, y }, { r }]] of wormholes(world)) {    
    context.fillStyle = colorInfluenced;
    context.beginPath();
    context.arc(Math.floor(x), Math.floor(y), r / 10, 0, 2 * Math.PI);
    context.fill();
  }
};

const physics = (world) => {
  for (const [, [t, { x, y }]] of junk(world)) {
    t.x += x;
    t.y += y;
  }
};

const world = Javelin.createWorld({
  systems: [physics, attract, render],
});
const junkCount = 10000;

for (let i = 0; i < junkCount; i++) {
  const x = Math.random() * (canvas.width * 1.5) - 0.25 * canvas.width
  const y = Math.random() * (canvas.height * 1.5) - 0.25 * canvas.height
  world.spawn(
    world.component(Transform, x, y),
    world.component(Velocity),
    world.component(Junk)
  );
}

let initialized = false;

canvas.addEventListener("mouseup", onMouseUp);

function spawnWormhole(x, y, r) {
  world.spawn(
    world.component(Transform, x, y),
    world.component(Wormhole, r),
    world.component(Velocity),
    world.component(Junk)
  );
}

function onMouseUp(event) {
  const { x, y } = relMouseCoords(canvas, event);
  const r = 30;

  spawnWormhole(x, y, r);
  clearInterval(interval);

  if (!initialized) {
    loop();
    initialized = true;
  }
}

function loop() {
  world.tick();
  requestAnimationFrame(loop);
}

let i = 0

const interval = setInterval(() => {
  if (++i >= 10) {
    clearInterval(interval)
  }
  spawnWormhole(
    Math.random() * canvas.width,
    Math.random() * canvas.height,
    Math.random() * 60
  );
  if (!initialized) {
    initialized = true;
    loop();
  }
}, 3500);

world.tick();
</script>
