import type { NotebookId } from "./notebook"

export type ConversationId = string
export type MessageId = string

export type MessageRole = "user" | "assistant"

export type Message = {
  id: MessageId
  conversationId: ConversationId
  role: MessageRole
  content: string
  createdAt: string
}

export type Conversation = {
  id: ConversationId
  notebookId: NotebookId
  saved: boolean
  createdAt: string
  updatedAt: string
  messages: Message[]
}
