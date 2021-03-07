import nodeResolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default {
  input: "dist/esm/index.js",
  output: {
    file: "dist/javelin-pack.bundle.min.js",
    format: "umd",
    name: "JavelinPack",
  },
  plugins: [nodeResolve(), terser()],
}
