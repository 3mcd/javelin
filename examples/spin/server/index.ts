import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { PORT, TICK_RATE } from "./env"
import { server } from "./net"
import { world } from "./world"

createHrtimeLoop((1 / TICK_RATE) * 1000, world.tick).start()

server.listen(PORT)
