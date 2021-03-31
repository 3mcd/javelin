import { Query } from "@javelin/ecs"

type MessageProducerQueryConfig = {
  query: Query
  priority?: number
}

type MessageProducerOptions = {
  queries: MessageProducerQueryConfig[]
}

export function createMessageProducer() {}
