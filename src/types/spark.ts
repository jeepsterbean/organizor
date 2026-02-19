export type SparkId = string
export type SparkRootId = string
export type NotebookId = string

export type Spark = {
  id: SparkId
  rootId: SparkRootId
  parentId: SparkId | null
  content: string
  createdAt: string
}

export type SparkHead = {
  rootId: SparkRootId
  headId: SparkId
  title: string | null
  updatedAt: string
}

export type SparkRoutingStatus = "routed" | "unrouted"

export type SparkRouting = {
  rootId: SparkRootId
  notebookId: NotebookId | null
  routedAt: string
}

/**
 * Denormalized view of a spark with its head and routing info.
 * This is what UI components work with.
 */
export type SparkWithMeta = {
  rootId: SparkRootId
  headId: SparkId
  content: string
  title: string | null
  createdAt: string
  updatedAt: string
  routingStatus: SparkRoutingStatus
  notebookId: NotebookId | null
}
