import { T } from "@/styles/tokens"

type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        fontFamily: T.font,
      }}
      onClick={onCancel}
    >
      <div
        className="scale-in"
        style={{
          width: 360,
          borderRadius: T.radiusLg,
          background: T.bgSurface,
          border: `1px solid ${T.border}`,
          padding: 24,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: T.textSecondary, lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "7px 16px",
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
            onClick={onConfirm}
            style={{
              padding: "7px 16px",
              borderRadius: T.radiusSm,
              background: danger ? T.danger : T.accent,
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: T.font,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
