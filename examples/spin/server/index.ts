import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { PORT, TICK_RATE } from "./env"
import { server } from "./net"
import { world } from "./world"

createHrtimeLoop(world.step, (1 / TICK_RATE) * 1000).start()

server.listen(PORT)
