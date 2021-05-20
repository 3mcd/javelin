import { Server } from "@web-udp/server"
import { createServer } from "http"

export const server = createServer()
export const udp = new Server({ server })
