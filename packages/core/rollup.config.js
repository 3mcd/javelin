import nodeResolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default {
  input: "dist/esm/index.js",
  output: {
    file: "dist/javelin-core.bundle.min.js",
    format: "umd",
    name: "JavelinCore",
  },
  plugins: [nodeResolve(), terser()],
}
