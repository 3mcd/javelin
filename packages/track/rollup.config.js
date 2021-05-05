import nodeResolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

export default {
  input: "dist/esm/index.js",
  output: {
    file: "dist/javelin-track.bundle.min.js",
    format: "umd",
    name: "Javelin",
  },
  plugins: [nodeResolve(), terser()],
}
