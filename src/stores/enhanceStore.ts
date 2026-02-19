import { create } from "zustand"

export type EnhanceState =
  | { status: "idle" }
  | { status: "overlay_open"; request: string }
  | { status: "loading" }
  | { status: "suggestion_ready"; suggestion: string; originalText: string | null }
  | { status: "error"; error: string }

type EnhanceStore = {
  state: EnhanceState
  selectedText: string | null

  openOverlay: (selectedText?: string) => void
  closeOverlay: () => void
  setRequest: (request: string) => void
  setLoading: () => void
  setSuggestion: (suggestion: string, originalText: string | null) => void
  setError: (error: string) => void
  reset: () => void
}

export const useEnhanceStore = create<EnhanceStore>((set) => ({
  state: { status: "idle" },
  selectedText: null,

  openOverlay: (selectedText) => {
    set({ state: { status: "overlay_open", request: "" }, selectedText: selectedText ?? null })
  },

  closeOverlay: () => set({ state: { status: "idle" }, selectedText: null }),

  setRequest: (request) => {
    set((prev) => {
      if (prev.state.status === "overlay_open") {
        return { state: { status: "overlay_open", request } }
      }
      return {}
    })
  },

  setLoading: () => set({ state: { status: "loading" } }),

  setSuggestion: (suggestion, originalText) =>
    set({ state: { status: "suggestion_ready", suggestion, originalText } }),

  setError: (error) => set({ state: { status: "error", error } }),

  reset: () => set({ state: { status: "idle" }, selectedText: null }),
}))
