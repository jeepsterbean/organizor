import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getNotebookTree,
  getNotebook,
  getNotebookWithRelations,
  createNotebook,
  updateNotebookBody,
  updateNotebookName,
  deleteNotebook,
  addReference,
  removeReference,
} from "@/services/notebookService"
import type { NotebookId, TiptapJSON } from "@/types/notebook"

export const notebookQueryKeys = {
  all: ["notebooks"] as const,
  single: (id: NotebookId) => ["notebooks", id] as const,
  withRelations: (id: NotebookId) => ["notebooks", id, "relations"] as const,
}

export function useNotebooks() {
  return useQuery({
    queryKey: notebookQueryKeys.all,
    queryFn: getNotebookTree,
  })
}

export function useNotebook(id: NotebookId | null) {
  return useQuery({
    queryKey: notebookQueryKeys.single(id ?? ""),
    queryFn: () => getNotebook(id!),
    enabled: id !== null,
  })
}

export function useNotebookWithRelations(id: NotebookId | null) {
  return useQuery({
    queryKey: notebookQueryKeys.withRelations(id ?? ""),
    queryFn: () => getNotebookWithRelations(id!),
    enabled: id !== null,
  })
}

export function useCreateNotebook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, parentNotebookId }: { name: string; parentNotebookId?: NotebookId }) =>
      createNotebook(name, parentNotebookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notebookQueryKeys.all })
    },
  })
}

export function useUpdateNotebookBody() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: NotebookId; body: TiptapJSON }) =>
      updateNotebookBody(id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: notebookQueryKeys.single(id) })
      queryClient.invalidateQueries({ queryKey: notebookQueryKeys.all })
    },
  })
}

export function useUpdateNotebookName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: NotebookId; name: string }) =>
      updateNotebookName(id, name),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: notebookQueryKeys.single(id) })
      queryClient.invalidateQueries({ queryKey: notebookQueryKeys.all })
    },
  })
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: NotebookId) => deleteNotebook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notebookQueryKeys.all })
    },
  })
}

export function useAddReference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ notebookId, referencedId }: { notebookId: NotebookId; referencedId: NotebookId }) =>
      addReference(notebookId, referencedId),
    onSuccess: (_data, { notebookId }) => {
      queryClient.invalidateQueries({ queryKey: notebookQueryKeys.withRelations(notebookId) })
    },
  })
}

export function useRemoveReference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ notebookId, referencedId }: { notebookId: NotebookId; referencedId: NotebookId }) =>
      removeReference(notebookId, referencedId),
    onSuccess: (_data, { notebookId }) => {
      queryClient.invalidateQueries({ queryKey: notebookQueryKeys.withRelations(notebookId) })
    },
  })
}
