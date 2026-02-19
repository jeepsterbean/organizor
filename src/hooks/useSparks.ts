import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAllSparks,
  getUnroutedSparks,
  getSparkHistory,
  createSpark,
  editSpark,
  routeSpark,
  unrouteSpark,
  addTitleToSpark,
  deleteSpark,
  getNotebookSparks,
} from "@/services/sparkService"
import type { SparkRootId } from "@/types/spark"
import type { NotebookId } from "@/types/notebook"

export const sparkQueryKeys = {
  all: ["sparks"] as const,
  unrouted: ["sparks", "unrouted"] as const,
  history: (rootId: SparkRootId) => ["sparks", "history", rootId] as const,
  notebookSparks: (notebookId: NotebookId) => ["sparks", "notebook", notebookId] as const,
}

export function useAllSparks() {
  return useQuery({
    queryKey: sparkQueryKeys.all,
    queryFn: getAllSparks,
  })
}

export function useUnroutedSparks() {
  return useQuery({
    queryKey: sparkQueryKeys.unrouted,
    queryFn: getUnroutedSparks,
  })
}

export function useSparkHistory(rootId: SparkRootId | null) {
  return useQuery({
    queryKey: sparkQueryKeys.history(rootId ?? ""),
    queryFn: () => getSparkHistory(rootId!),
    enabled: rootId !== null,
  })
}

export function useNotebookSparks(notebookId: NotebookId | null) {
  return useQuery({
    queryKey: sparkQueryKeys.notebookSparks(notebookId ?? ""),
    queryFn: () => getNotebookSparks(notebookId!),
    enabled: notebookId !== null,
  })
}

export function useCreateSpark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      content,
      title,
      notebookId,
    }: {
      content: string
      title?: string
      notebookId?: NotebookId
    }) => createSpark(content, title, notebookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.unrouted })
    },
  })
}

export function useEditSpark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rootId, content }: { rootId: SparkRootId; content: string }) =>
      editSpark(rootId, content),
    onSuccess: (_data, { rootId }) => {
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.history(rootId) })
    },
  })
}

export function useRouteSpark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rootId, notebookId }: { rootId: SparkRootId; notebookId: NotebookId }) =>
      routeSpark(rootId, notebookId),
    onSuccess: (_data, { notebookId }) => {
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.unrouted })
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.notebookSparks(notebookId) })
    },
  })
}

export function useUnrouteSpark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rootId: SparkRootId) => unrouteSpark(rootId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.unrouted })
    },
  })
}

export function useAddTitleToSpark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ rootId, title }: { rootId: SparkRootId; title: string }) =>
      addTitleToSpark(rootId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.all })
    },
  })
}

export function useDeleteSpark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rootId: SparkRootId) => deleteSpark(rootId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: sparkQueryKeys.unrouted })
    },
  })
}
