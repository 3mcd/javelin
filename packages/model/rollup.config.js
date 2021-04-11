import nodeResolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default {
  input: "dist/esm/index.js",
  output: {
    file: "dist/javelin-model.bundle.min.js",
    format: "umd",
    name: "JavelinModel",
  },
  plugins: [nodeResolve(), terser()],
}
