import { z } from "zod"

export const MessageRoleSchema = z.enum(["user", "assistant"])

export const MessageRowSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  created_at: z.string(),
})

export const ConversationRowSchema = z.object({
  id: z.string(),
  notebook_id: z.string(),
  saved: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const AIResponseSchema = z.object({
  content: z.string().min(1),
})

export type MessageRow = z.infer<typeof MessageRowSchema>
export type ConversationRow = z.infer<typeof ConversationRowSchema>
