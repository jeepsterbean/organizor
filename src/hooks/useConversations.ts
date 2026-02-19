import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getConversations,
  getOrCreateConversation,
  sendMessage,
  saveConversation,
  deleteConversation,
  createConversation,
} from "@/services/chatService"
import type { ConversationId, Message } from "@/types/conversation"
import type { NotebookId } from "@/types/notebook"

export const conversationQueryKeys = {
  list: (notebookId: NotebookId) => ["conversations", notebookId] as const,
  active: (notebookId: NotebookId) => ["conversations", notebookId, "active"] as const,
}

export function useConversations(notebookId: NotebookId | null) {
  return useQuery({
    queryKey: conversationQueryKeys.list(notebookId ?? ""),
    queryFn: () => getConversations(notebookId!),
    enabled: notebookId !== null,
  })
}

export function useActiveConversation(notebookId: NotebookId | null) {
  return useQuery({
    queryKey: conversationQueryKeys.active(notebookId ?? ""),
    queryFn: () => getOrCreateConversation(notebookId!),
    enabled: notebookId !== null,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notebookId: NotebookId) => createConversation(notebookId),
    onSuccess: (_data, notebookId) => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.list(notebookId) })
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.active(notebookId) })
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      context,
      previousMessages,
      notebookId,
    }: {
      conversationId: ConversationId
      content: string
      context: { notebookName: string; notebookBody?: string; selectedText?: string }
      previousMessages: Message[]
      notebookId: NotebookId
    }) => sendMessage(conversationId, content, context, previousMessages),
    onSuccess: (_data, { notebookId }) => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.active(notebookId) })
    },
  })
}

export function useSaveConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notebookId }: { id: ConversationId; notebookId: NotebookId }) =>
      saveConversation(id),
    onSuccess: (_data, { notebookId }) => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.list(notebookId) })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notebookId }: { id: ConversationId; notebookId: NotebookId }) =>
      deleteConversation(id),
    onSuccess: (_data, { notebookId }) => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.list(notebookId) })
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.active(notebookId) })
    },
  })
}
