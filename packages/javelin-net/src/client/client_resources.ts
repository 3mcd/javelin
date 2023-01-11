import {resource} from "@javelin/ecs"
import {NetworkTransport} from "../network_transport.js"

export let ServerTransport = resource<NetworkTransport>()
