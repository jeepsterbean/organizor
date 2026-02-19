import type { SparkRootId } from "./spark"

export type NotebookId = string

export type TiptapJSON = {
  type: string
  content?: TiptapNode[]
}

export type TiptapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  text?: string
}

export type Notebook = {
  id: NotebookId
  name: string
  body: TiptapJSON | null
  parentNotebookId: NotebookId | null
  createdAt: string
  updatedAt: string
}

export type NotebookReference = {
  notebookId: NotebookId
  referencedNotebookId: NotebookId
  createdAt: string
}

export type NotebookWithRelations = Notebook & {
  childIds: NotebookId[]
  referenceIds: NotebookId[]
  backlinkIds: NotebookId[]
  routedSparkRootIds: SparkRootId[]
  sparkCount: number
}
