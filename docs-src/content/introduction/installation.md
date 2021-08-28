+++
title = "Installation"
weight = 1
+++

## npm

Javelin ECS can be installed via `npm`:

```bash
npm i @javelin/ecs
```

The following builds are published to NPM:

### ES Modules

**Path**: `dist/esm/index.js`

The package.json `module` field points to the ESM build, which will be automatically discovered by tools like Webpack, Rollup, and Node >=13.2.0.

```ts
import * as ECS from "@javelin/ecs"
```

You can of course also import the ES module directly in browsers that support ECMAScript modules.

<!-- prettier-ignore -->
```html
<script type="module" src="node_modules/@javelin/ecs/dist/esm/index.js"></script>
```

### CommonJS

**Path**: `dist/cjs/index.js`

The package.json `main` field points to the CommonJS build, which will be included automatically when loaded with `require`:

<!-- prettier-ignore -->
```ts
const ECS = require("@javelin/ecs")
```
