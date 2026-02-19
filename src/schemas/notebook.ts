import { z } from "zod"

export const TiptapNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.unknown()).optional(),
    content: z.array(TiptapNodeSchema).optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.unknown()).optional(),
        }),
      )
      .optional(),
    text: z.string().optional(),
  }),
)

export const TiptapJSONSchema = z.object({
  type: z.string(),
  content: z.array(TiptapNodeSchema).optional(),
})

export const NotebookRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  body: TiptapJSONSchema.nullable(),
  parent_notebook_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type NotebookRow = z.infer<typeof NotebookRowSchema>
