import { nanoid } from "nanoid"
import { supabase, transformNotebookRow, transformNotebookReferenceRow } from "@/lib/supabase"
import { NotebookRowSchema } from "@/schemas/notebook"
import type { Notebook, NotebookWithRelations, NotebookId, TiptapJSON } from "@/types/notebook"

export async function createNotebook(name: string, parentNotebookId?: NotebookId): Promise<Notebook> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("notebooks")
    .insert({
      id: nanoid(),
      name,
      body: null,
      parent_notebook_id: parentNotebookId ?? null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) throw error
  return transformNotebookRow(NotebookRowSchema.parse(data))
}

export async function getNotebook(id: NotebookId): Promise<Notebook> {
  const { data, error } = await supabase
    .from("notebooks")
    .select()
    .eq("id", id)
    .single()

  if (error) throw error
  return transformNotebookRow(NotebookRowSchema.parse(data))
}

export async function updateNotebookBody(id: NotebookId, body: TiptapJSON): Promise<void> {
  const { error } = await supabase
    .from("notebooks")
    .update({ body, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function updateNotebookName(id: NotebookId, name: string): Promise<void> {
  const { error } = await supabase
    .from("notebooks")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function deleteNotebook(id: NotebookId): Promise<void> {
  // Reparent children to this notebook's parent before deleting
  const notebookResult = await supabase
    .from("notebooks")
    .select("parent_notebook_id")
    .eq("id", id)
    .single()

  if (notebookResult.error) throw notebookResult.error

  const { error: reparentError } = await supabase
    .from("notebooks")
    .update({ parent_notebook_id: notebookResult.data.parent_notebook_id })
    .eq("parent_notebook_id", id)

  if (reparentError) throw reparentError

  const { error } = await supabase.from("notebooks").delete().eq("id", id)
  if (error) throw error
}

export async function getNotebookTree(): Promise<Notebook[]> {
  const { data, error } = await supabase
    .from("notebooks")
    .select()
    .order("updated_at", { ascending: false })

  if (error) throw error
  return data.map((row) => transformNotebookRow(NotebookRowSchema.parse(row)))
}

export async function getNotebookWithRelations(id: NotebookId): Promise<NotebookWithRelations> {
  const [notebookResult, childrenResult, referencesResult, backlinksResult, routedSparksResult] = await Promise.all([
    supabase.from("notebooks").select().eq("id", id).single(),
    supabase.from("notebooks").select("id").eq("parent_notebook_id", id),
    supabase.from("notebook_references").select().eq("notebook_id", id),
    supabase.from("notebook_references").select().eq("referenced_notebook_id", id),
    supabase.from("spark_routings").select("root_id").eq("notebook_id", id),
  ])

  if (notebookResult.error) throw notebookResult.error

  const notebook = transformNotebookRow(NotebookRowSchema.parse(notebookResult.data))
  const childIds = (childrenResult.data ?? []).map((c: { id: string }) => c.id)
  const referenceIds = (referencesResult.data ?? []).map((r) => transformNotebookReferenceRow(r).referencedNotebookId)
  const backlinkIds = (backlinksResult.data ?? []).map((r) => transformNotebookReferenceRow(r).notebookId)
  const routedSparkRootIds = (routedSparksResult.data ?? []).map((r: { root_id: string }) => r.root_id)

  return {
    ...notebook,
    childIds,
    referenceIds,
    backlinkIds,
    routedSparkRootIds,
    sparkCount: routedSparkRootIds.length,
  }
}

export async function addReference(notebookId: NotebookId, referencedId: NotebookId): Promise<void> {
  const { error } = await supabase.from("notebook_references").insert({
    notebook_id: notebookId,
    referenced_notebook_id: referencedId,
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function removeReference(notebookId: NotebookId, referencedId: NotebookId): Promise<void> {
  const { error } = await supabase
    .from("notebook_references")
    .delete()
    .eq("notebook_id", notebookId)
    .eq("referenced_notebook_id", referencedId)

  if (error) throw error
}
