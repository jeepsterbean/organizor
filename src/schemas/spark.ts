import { z } from "zod"

export const SparkRowSchema = z.object({
  id: z.string(),
  root_id: z.string(),
  parent_id: z.string().nullable(),
  content: z.string(),
  created_at: z.string(),
})

export const SparkHeadRowSchema = z.object({
  root_id: z.string(),
  head_id: z.string(),
  title: z.string().nullable(),
  updated_at: z.string(),
})

export const SparkRoutingRowSchema = z.object({
  root_id: z.string(),
  notebook_id: z.string().nullable(),
  routed_at: z.string(),
})

export type SparkRow = z.infer<typeof SparkRowSchema>
export type SparkHeadRow = z.infer<typeof SparkHeadRowSchema>
export type SparkRoutingRow = z.infer<typeof SparkRoutingRowSchema>
