import { nanoid } from "nanoid"
import { supabase, transformSparkRow, transformSparkHeadRow, transformSparkRoutingRow, buildSparkWithMeta } from "@/lib/supabase"
import { SparkRowSchema, SparkHeadRowSchema, SparkRoutingRowSchema } from "@/schemas/spark"
import type { Spark, SparkHead, SparkWithMeta, SparkRootId, SparkId } from "@/types/spark"
import type { NotebookId } from "@/types/notebook"

export async function createSpark(content: string, title?: string, notebookId?: NotebookId): Promise<SparkWithMeta> {
  const sparkId = nanoid()
  const rootId = nanoid()
  const now = new Date().toISOString()

  const [sparkResult, headResult, routingResult] = await Promise.all([
    supabase
      .from("sparks")
      .insert({ id: sparkId, root_id: rootId, parent_id: null, content, created_at: now })
      .select()
      .single(),
    supabase
      .from("spark_heads")
      .insert({ root_id: rootId, head_id: sparkId, title: title ?? null, updated_at: now })
      .select()
      .single(),
    supabase
      .from("spark_routings")
      .insert({ root_id: rootId, notebook_id: notebookId ?? null, routed_at: now })
      .select()
      .single(),
  ])

  if (sparkResult.error) throw sparkResult.error
  if (headResult.error) throw headResult.error
  if (routingResult.error) throw routingResult.error

  const spark = transformSparkRow(SparkRowSchema.parse(sparkResult.data))
  const head = transformSparkHeadRow(SparkHeadRowSchema.parse(headResult.data))
  const routing = transformSparkRoutingRow(SparkRoutingRowSchema.parse(routingResult.data))

  return buildSparkWithMeta(head, spark, routing)
}

export async function editSpark(rootId: SparkRootId, newContent: string): Promise<SparkWithMeta> {
  const headResult = await supabase
    .from("spark_heads")
    .select("head_id")
    .eq("root_id", rootId)
    .single()
  if (headResult.error) throw headResult.error

  const previousSparkId: SparkId = headResult.data.head_id
  const newSparkId = nanoid()
  const now = new Date().toISOString()

  const [newSparkResult, updatedHeadResult] = await Promise.all([
    supabase
      .from("sparks")
      .insert({
        id: newSparkId,
        root_id: rootId,
        parent_id: previousSparkId,
        content: newContent,
        created_at: now,
      })
      .select()
      .single(),
    supabase
      .from("spark_heads")
      .update({ head_id: newSparkId, updated_at: now })
      .eq("root_id", rootId)
      .select()
      .single(),
  ])

  if (newSparkResult.error) throw newSparkResult.error
  if (updatedHeadResult.error) throw updatedHeadResult.error

  const spark = transformSparkRow(SparkRowSchema.parse(newSparkResult.data))
  const head = transformSparkHeadRow(SparkHeadRowSchema.parse(updatedHeadResult.data))

  const routingResult = await supabase
    .from("spark_routings")
    .select()
    .eq("root_id", rootId)
    .single()

  const routing = routingResult.data ? transformSparkRoutingRow(SparkRoutingRowSchema.parse(routingResult.data)) : null
  return buildSparkWithMeta(head, spark, routing)
}

export async function getSparkHistory(rootId: SparkRootId): Promise<Spark[]> {
  const { data, error } = await supabase
    .from("sparks")
    .select()
    .eq("root_id", rootId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data.map((row) => transformSparkRow(SparkRowSchema.parse(row)))
}

export async function getAllSparks(): Promise<SparkWithMeta[]> {
  const [headsResult, routingsResult] = await Promise.all([
    supabase.from("spark_heads").select(),
    supabase.from("spark_routings").select(),
  ])

  if (headsResult.error) throw headsResult.error
  if (routingsResult.error) throw routingsResult.error

  const heads = headsResult.data.map((row) => transformSparkHeadRow(SparkHeadRowSchema.parse(row)))
  const routingMap = new Map(
    routingsResult.data.map((row) => {
      const routing = transformSparkRoutingRow(SparkRoutingRowSchema.parse(row))
      return [routing.rootId, routing]
    }),
  )

  const headIds = heads.map((h) => h.headId)
  const { data: sparksData, error: sparksError } = await supabase
    .from("sparks")
    .select()
    .in("id", headIds)

  if (sparksError) throw sparksError

  const sparkMap = new Map(
    sparksData.map((row) => {
      const spark = transformSparkRow(SparkRowSchema.parse(row))
      return [spark.id, spark]
    }),
  )

  return heads
    .map((head) => {
      const latestSpark = sparkMap.get(head.headId)
      if (!latestSpark) return null
      const routing = routingMap.get(head.rootId) ?? null
      return buildSparkWithMeta(head, latestSpark, routing)
    })
    .filter((s): s is SparkWithMeta => s !== null)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export async function getUnroutedSparks(): Promise<SparkWithMeta[]> {
  const all = await getAllSparks()
  return all.filter((s) => s.routingStatus === "unrouted")
}

export async function routeSpark(rootId: SparkRootId, notebookId: NotebookId): Promise<void> {
  const { error } = await supabase
    .from("spark_routings")
    .update({ notebook_id: notebookId, routed_at: new Date().toISOString() })
    .eq("root_id", rootId)

  if (error) throw error
}

export async function unrouteSpark(rootId: SparkRootId): Promise<void> {
  const { error } = await supabase
    .from("spark_routings")
    .update({ notebook_id: null })
    .eq("root_id", rootId)

  if (error) throw error
}

export async function addTitleToSpark(rootId: SparkRootId, title: string): Promise<void> {
  const { error } = await supabase
    .from("spark_heads")
    .update({ title })
    .eq("root_id", rootId)

  if (error) throw error
}

export async function getNotebookSparks(notebookId: NotebookId): Promise<SparkWithMeta[]> {
  const all = await getAllSparks()
  return all.filter((s) => s.notebookId === notebookId)
}

export async function deleteSpark(rootId: SparkRootId): Promise<void> {
  const { error: routingError } = await supabase
    .from("spark_routings")
    .delete()
    .eq("root_id", rootId)
  if (routingError) throw routingError

  const { error: headError } = await supabase
    .from("spark_heads")
    .delete()
    .eq("root_id", rootId)
  if (headError) throw headError

  const { error: sparksError } = await supabase
    .from("sparks")
    .delete()
    .eq("root_id", rootId)
  if (sparksError) throw sparksError
}

export async function getSparkHead(rootId: SparkRootId): Promise<SparkHead> {
  const { data, error } = await supabase
    .from("spark_heads")
    .select()
    .eq("root_id", rootId)
    .single()
  if (error) throw error
  return transformSparkHeadRow(SparkHeadRowSchema.parse(data))
}
