import { createClient } from "@supabase/supabase-js"
import type { Spark, SparkHead, SparkRouting, SparkWithMeta } from "@/types/spark"
import type { Notebook, NotebookReference } from "@/types/notebook"
import type { Conversation, Message } from "@/types/conversation"
import {
  SparkRowSchema,
  SparkHeadRowSchema,
  SparkRoutingRowSchema,
  type SparkRow,
  type SparkHeadRow,
  type SparkRoutingRow,
} from "@/schemas/spark"
import {
  NotebookRowSchema,
  type NotebookRow,
} from "@/schemas/notebook"
import {
  MessageRowSchema,
  ConversationRowSchema,
  type MessageRow,
  type ConversationRow,
} from "@/schemas/conversation"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Row → Domain Transformers ───

export function transformSparkRow(row: SparkRow): Spark {
  return SparkRowSchema.transform((r) => ({
    id: r.id,
    rootId: r.root_id,
    parentId: r.parent_id,
    content: r.content,
    createdAt: r.created_at,
  })).parse(row)
}

export function transformSparkHeadRow(row: SparkHeadRow): SparkHead {
  return SparkHeadRowSchema.transform((r) => ({
    rootId: r.root_id,
    headId: r.head_id,
    title: r.title,
    updatedAt: r.updated_at,
  })).parse(row)
}

export function transformSparkRoutingRow(row: SparkRoutingRow): SparkRouting {
  return SparkRoutingRowSchema.transform((r) => ({
    rootId: r.root_id,
    notebookId: r.notebook_id,
    routedAt: r.routed_at,
  })).parse(row)
}

export function transformNotebookRow(row: NotebookRow): Notebook {
  return NotebookRowSchema.transform((r) => ({
    id: r.id,
    name: r.name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: r.body as any,
    parentNotebookId: r.parent_notebook_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  })).parse(row)
}

export function transformMessageRow(row: MessageRow): Message {
  return MessageRowSchema.transform((r) => ({
    id: r.id,
    conversationId: r.conversation_id,
    role: r.role,
    content: r.content,
    createdAt: r.created_at,
  })).parse(row)
}

export function transformConversationRow(
  row: ConversationRow,
  messages: Message[],
): Conversation {
  return ConversationRowSchema.transform((r) => ({
    id: r.id,
    notebookId: r.notebook_id,
    saved: r.saved,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    messages,
  })).parse(row)
}

export function buildSparkWithMeta(
  head: SparkHead,
  latestSpark: Spark,
  routing: SparkRouting | null,
): SparkWithMeta {
  return {
    rootId: head.rootId,
    headId: head.headId,
    content: latestSpark.content,
    title: head.title,
    createdAt: latestSpark.createdAt,
    updatedAt: head.updatedAt,
    routingStatus: routing?.notebookId != null ? "routed" : "unrouted",
    notebookId: routing?.notebookId ?? null,
  }
}

export function transformNotebookReferenceRow(row: {
  notebook_id: string
  referenced_notebook_id: string
  created_at: string
}): NotebookReference {
  return {
    notebookId: row.notebook_id,
    referencedNotebookId: row.referenced_notebook_id,
    createdAt: row.created_at,
  }
}
