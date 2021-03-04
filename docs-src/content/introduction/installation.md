+++
title = "Installation"
weight = 1
+++

## npm

Javelin ECS can be installed via `npm`:

```bash
npm i @javelin/ecs
```

The following three builds are published to NPM:

### UMD

**Path**: `dist/javelin-ecs.bundle.min.js`

You can include the minified UMD bundle in your HTML via `<script>` tag. All module exports are available via `window.Javelin`:

<!-- prettier-ignore -->
```html
<script src="node_modules/@javelin/ecs/dist/javelin-ecs.bundle.min.js"></script>
<script>
  const world = Javelin.createWorld()
</script>
```

### ES Modules

**Path**: `dist/esm/index.js`

The package.json `module` field points to the ESM build, which will be automatically discovered by tools like Webpack and Rollup. You can of course also import the ES module directly in browsers that support ECMAScript modules.

<!-- prettier-ignore -->
```html
<script type="module" src="node_modules/@javelin/ecs/dist/esm/index.js"></script>
```

### CommonJS

<aside>
  <p><strong>Tip</strong> — this build does not support tree shaking.</p>
</aside>

**Path**: `dist/cjs/index.js`

The package.json `main` field points to the CommonJS build, which will be included automatically when loaded with Node's `require()`:

```typescript
const Javelin = require("@javelin/ecs")
```
