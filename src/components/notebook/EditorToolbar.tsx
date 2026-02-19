import { T } from "@/styles/tokens"
import { EnhanceIcon, PanelRightIcon } from "@/components/shared/Icons"
import { useEnhanceStore } from "@/stores/enhanceStore"

type EditorToolbarProps = {
  notebookName: string
  showRightPanel: boolean
  onToggleRightPanel: () => void
}

export function EditorToolbar({ notebookName, showRightPanel, onToggleRightPanel }: EditorToolbarProps) {
  const openOverlay = useEnhanceStore((s) => s.openOverlay)
  const selectedText = useEnhanceStore((s) => s.selectedText)

  function handleEnhance() {
    const editorSelectedText = (window as any).__tiptap_getSelectedText?.() ?? undefined
    openOverlay(editorSelectedText || undefined)
  }

  return (
    <div
      style={{
        height: 44,
        borderBottom: `1px solid ${T.borderSubtle}`,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 8,
        fontFamily: T.font,
        background: T.bgSurface,
      }}
    >
      <h2 style={{ fontSize: 14, fontWeight: 500, color: T.text, flex: 1 }}>{notebookName}</h2>

      <button
        onClick={handleEnhance}
        title="AI Enhance (⌘L)"
        style={{
          padding: "5px 12px",
          borderRadius: T.radiusSm,
          background: T.accentSubtle,
          border: `1px solid ${T.accentBorder}`,
          color: T.accent,
          fontSize: 12,
          fontFamily: T.font,
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(167,139,250,0.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = T.accentSubtle)}
      >
        <EnhanceIcon /> {selectedText ? "Enhance selection" : "Enhance"}
      </button>

      <button
        onClick={onToggleRightPanel}
        title="Toggle panel"
        style={{
          width: 32,
          height: 32,
          borderRadius: T.radiusSm,
          background: showRightPanel ? T.bgActive : "transparent",
          border: "none",
          color: showRightPanel ? T.accent : T.textSecondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <PanelRightIcon />
      </button>
    </div>
  )
}
