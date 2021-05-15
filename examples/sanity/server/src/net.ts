import { Server } from "@web-udp/server"
import { createServer } from "http"
import { PORT } from "./env.mjs"

export const server = createServer()
export const udp = new Server({ server })

server.listen(PORT)
