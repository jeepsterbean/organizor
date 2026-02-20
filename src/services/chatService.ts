import { nanoid } from "nanoid"
import { supabase, transformConversationRow, transformMessageRow } from "@/lib/supabase"
import { ConversationRowSchema, MessageRowSchema } from "@/schemas/conversation"
import { openaiClient } from "@/lib/openai"
import type { Conversation, ConversationId, Message } from "@/types/conversation"
import type { NotebookId } from "@/types/notebook"

export async function getOrCreateConversation(notebookId: NotebookId): Promise<Conversation> {
  // Use nested select to fetch messages in the same query
  const existing = await supabase
    .from("conversations")
    .select(`
      *,
      messages (*)
    `)
    .eq("notebook_id", notebookId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  if (existing.data) {
    const conversationRow = ConversationRowSchema.parse(existing.data)
    const messages = (existing.data.messages ?? []).map((msgRow: unknown) =>
      transformMessageRow(MessageRowSchema.parse(msgRow)),
    )
    // Sort messages by created_at ascending
    messages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    return transformConversationRow(conversationRow, messages)
  }

  return createConversation(notebookId)
}

export async function createConversation(notebookId: NotebookId): Promise<Conversation> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      id: nanoid(),
      notebook_id: notebookId,
      saved: false,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) throw error
  const conversationRow = ConversationRowSchema.parse(data)
  return transformConversationRow(conversationRow, [])
}

export async function getConversations(notebookId: NotebookId): Promise<Conversation[]> {
  // Use Supabase nested select to fetch conversations with messages in a single query
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      messages (*)
    `)
    .eq("notebook_id", notebookId)
    .order("updated_at", { ascending: false })

  if (error) throw error

  return data.map((row) => {
    const conversationRow = ConversationRowSchema.parse(row)
    const messages = (row.messages ?? []).map((msgRow: unknown) =>
      transformMessageRow(MessageRowSchema.parse(msgRow)),
    )
    // Sort messages by created_at ascending (Supabase may not preserve order)
    messages.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    return transformConversationRow(conversationRow, messages)
  })
}


type SendMessageContext = {
  notebookName: string
  notebookBody?: string
  selectedText?: string
}

export async function sendMessage(
  conversationId: ConversationId,
  content: string,
  context: SendMessageContext,
  previousMessages: Message[],
): Promise<Message> {
  const now = new Date().toISOString()

  // Persist user message
  const { data: userMsgData, error: userMsgError } = await supabase
    .from("messages")
    .insert({
      id: nanoid(),
      conversation_id: conversationId,
      role: "user",
      content,
      created_at: now,
    })
    .select()
    .single()

  if (userMsgError) throw userMsgError
  transformMessageRow(MessageRowSchema.parse(userMsgData))

  // Update conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: now })
    .eq("id", conversationId)

  // Build system prompt with notebook context
  const systemPrompt = buildSystemPrompt(context)

  // Build message history for OpenAI
  const openAiMessages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...previousMessages.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content },
  ]

  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }, ...openAiMessages],
    max_tokens: 1500,
  })

  const assistantContent = completion.choices[0]?.message?.content
  if (!assistantContent) throw new Error("Empty response from OpenAI")

  const assistantNow = new Date().toISOString()
  const { data: assistantMsgData, error: assistantMsgError } = await supabase
    .from("messages")
    .insert({
      id: nanoid(),
      conversation_id: conversationId,
      role: "assistant",
      content: assistantContent,
      created_at: assistantNow,
    })
    .select()
    .single()

  if (assistantMsgError) throw assistantMsgError
  return transformMessageRow(MessageRowSchema.parse(assistantMsgData))
}

function buildSystemPrompt(context: SendMessageContext): string {
  const parts = [
    `You are an AI assistant helping the user think through and develop ideas in their notebook titled "${context.notebookName}".`,
    "Be concise, insightful, and help the user deepen their thinking.",
  ]

  if (context.selectedText) {
    parts.push(`\nThe user has selected the following text to focus on:\n---\n${context.selectedText}\n---`)
  } else if (context.notebookBody) {
    parts.push(`\nHere is the current content of the notebook:\n---\n${context.notebookBody}\n---`)
  }

  return parts.join("\n")
}

export async function saveConversation(id: ConversationId): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({ saved: true })
    .eq("id", id)

  if (error) throw error
}

export async function deleteConversation(id: ConversationId): Promise<void> {
  const { error } = await supabase.from("conversations").delete().eq("id", id)
  if (error) throw error
}
