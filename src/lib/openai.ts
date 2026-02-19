import OpenAI from "openai"

export const openaiClient = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // For personal use only — do not expose API key publicly
})
