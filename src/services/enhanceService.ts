import { openaiClient } from "@/lib/openai"
import { AIResponseSchema } from "@/schemas/conversation"

export type EnhancementRequest = {
  notebookName: string
  notebookBody?: string
  selectedText?: string
  userRequest: string
}

export type EnhancementResult = {
  suggestion: string
  originalText: string | null
}

export async function generateEnhancement(request: EnhancementRequest): Promise<EnhancementResult> {
  const systemPrompt = buildEnhancementSystemPrompt(request)
  const userPrompt = request.userRequest

  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2000,
  })

  const rawContent = completion.choices[0]?.message?.content
  if (!rawContent) throw new Error("Empty response from OpenAI")

  // Validate the response is non-empty
  const validated = AIResponseSchema.parse({ content: rawContent })

  return {
    suggestion: validated.content,
    originalText: request.selectedText ?? null,
  }
}

function buildEnhancementSystemPrompt(request: EnhancementRequest): string {
  const parts = [
    `You are an AI writing assistant helping improve a notebook titled "${request.notebookName}".`,
    "Provide only the enhanced/suggested text without any preamble or explanation.",
    "Match the tone and style of the existing content.",
  ]

  if (request.selectedText) {
    parts.push(`\nThe user wants you to enhance this specific passage:\n---\n${request.selectedText}\n---`)
    parts.push("\nReturn only the improved version of the selected text.")
  } else if (request.notebookBody) {
    parts.push(`\nHere is the current notebook content for context:\n---\n${request.notebookBody}\n---`)
    parts.push("\nGenerate new content to add to the notebook based on the user's request.")
  }

  return parts.join("\n")
}
