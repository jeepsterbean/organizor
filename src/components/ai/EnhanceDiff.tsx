import { T } from "@/styles/tokens"
import { EnhanceIcon, CheckIcon, XIcon } from "@/components/shared/Icons"
import { useEnhanceStore } from "@/stores/enhanceStore"

type EnhanceDiffProps = {
  onClose: () => void
}

export function EnhanceDiff({ onClose }: EnhanceDiffProps) {
  const enhanceState = useEnhanceStore((s) => s.state)
  const reset = useEnhanceStore((s) => s.reset)

  if (enhanceState.status !== "suggestion_ready") return null

  const { suggestion, originalText } = enhanceState

  function handleAccept() {
    // In a real implementation we'd inject this into the Tiptap editor
    // For now, copy to clipboard and notify
    navigator.clipboard.writeText(suggestion).catch(() => {})
    reset()
  }

  function handleReject() {
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 150,
        fontFamily: T.font,
      }}
      onClick={handleReject}
    >
      <div
        className="scale-in"
        style={{
          width: 640,
          maxHeight: "80vh",
          borderRadius: T.radiusLg,
          background: T.bgSurface,
          border: `1px solid ${T.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
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
            AI Suggestion
          </span>
          <button
            onClick={handleReject}
            style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}
          >
            <XIcon />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {originalText && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: T.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Original
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: T.radiusSm,
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: T.textSecondary,
                  whiteSpace: "pre-wrap",
                }}
              >
                {originalText}
              </div>
            </div>
          )}

          <div>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Suggestion
            </div>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: T.radiusSm,
                background: "rgba(52,211,153,0.06)",
                border: "1px solid rgba(52,211,153,0.2)",
                fontSize: 14,
                lineHeight: 1.7,
                color: T.text,
                whiteSpace: "pre-wrap",
              }}
            >
              {suggestion}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: `1px solid ${T.borderSubtle}`,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <div style={{ fontSize: 12, color: T.textMuted, flex: 1, display: "flex", alignItems: "center" }}>
            Accept copies to clipboard
          </div>
          <button
            onClick={handleReject}
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
            Dismiss
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: "8px 18px",
              borderRadius: T.radiusSm,
              background: T.success,
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: T.font,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CheckIcon size={14} /> Accept
          </button>
        </div>
      </div>
    </div>
  )
}
