import nodeResolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default {
  input: "dist/esm/index.js",
  output: {
    file: "dist/javelin-effects.bundle.min.js",
    format: "umd",
    name: "JavelinEffects",
  },
  plugins: [nodeResolve(), terser()],
}
