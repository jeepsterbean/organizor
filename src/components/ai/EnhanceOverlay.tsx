import { T } from "@/styles/tokens"
import { EnhanceIcon, XIcon } from "@/components/shared/Icons"
import { useEnhanceStore } from "@/stores/enhanceStore"
import { generateEnhancement } from "@/services/enhanceService"
import { useState } from "react"

type EnhanceOverlayProps = {
  onClose: () => void
}

export function EnhanceOverlay({ onClose }: EnhanceOverlayProps) {
  const enhanceState = useEnhanceStore((s) => s.state)
  const selectedText = useEnhanceStore((s) => s.selectedText)
  const setLoading = useEnhanceStore((s) => s.setLoading)
  const setSuggestion = useEnhanceStore((s) => s.setSuggestion)
  const setError = useEnhanceStore((s) => s.setError)
  const [request, setRequest] = useState(
    enhanceState.status === "overlay_open" ? enhanceState.request : "",
  )

  async function handleSubmit() {
    if (!request.trim()) return
    setLoading()

    try {
      const result = await generateEnhancement({
        notebookName: "current notebook",
        selectedText: selectedText ?? undefined,
        userRequest: request.trim(),
      })
      setSuggestion(result.suggestion, result.originalText)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error"
      setError(message)
    }
  }

  const isLoading = enhanceState.status === "loading"

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 150,
        fontFamily: T.font,
      }}
      onClick={onClose}
    >
      <div
        className="scale-in"
        style={{
          width: 480,
          borderRadius: T.radiusLg,
          background: T.bgSurface,
          border: `1px solid ${T.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${T.borderSubtle}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <EnhanceIcon />
          <span style={{ fontSize: 13, fontWeight: 500, color: T.accent, flex: 1 }}>
            AI Enhance {selectedText ? "-- selection" : "-- notebook"}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}
          >
            <XIcon />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {selectedText && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: T.radiusSm,
                background: T.bgActive,
                border: `1px solid ${T.borderSubtle}`,
                fontSize: 13,
                color: T.textSecondary,
                lineHeight: 1.6,
                marginBottom: 16,
                maxHeight: 100,
                overflow: "auto",
              }}
            >
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Selected text</div>
              "{selectedText}"
            </div>
          )}

          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder={
              selectedText
                ? "How should I improve this? (e.g. make it clearer, expand it...)"
                : "What should I add or improve? (e.g. add a section on...)"
            }
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
              if (e.key === "Escape") onClose()
            }}
            style={{
              width: "100%",
              minHeight: 80,
              background: T.bgActive,
              border: `1px solid ${T.borderSubtle}`,
              borderRadius: T.radiusSm,
              padding: "10px 14px",
              color: T.text,
              fontSize: 13.5,
              fontFamily: T.font,
              lineHeight: 1.6,
              outline: "none",
              resize: "none",
            }}
          />

          {enhanceState.status === "error" && (
            <div style={{ fontSize: 12.5, color: T.danger, marginTop: 8 }}>
              Error: {enhanceState.error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: T.radiusSm,
                background: "transparent",
                border: `1px solid ${T.border}`,
                color: T.textSecondary,
                fontSize: 13,
                fontFamily: T.font,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!request.trim() || isLoading}
              style={{
                padding: "8px 18px",
                borderRadius: T.radiusSm,
                background: T.accent,
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: T.font,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: !request.trim() || isLoading ? 0.6 : 1,
              }}
            >
              <EnhanceIcon size={14} />
              {isLoading ? "Generating..." : "Generate (Cmd+Enter)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
