import { useState, useCallback, useRef } from "react"
import { T } from "@/styles/tokens"
import { EditorToolbar } from "./EditorToolbar"
import { RichEditor } from "./RichEditor"
import { RightPanel } from "./RightPanel"
import { RawSparkViewer } from "./RawSparkViewer"
import { AIChatPanel } from "@/components/ai/AIChatPanel"
import { ChatIcon, XIcon } from "@/components/shared/Icons"
import { useUpdateNotebookBody } from "@/hooks/useNotebooks"
import type { Notebook } from "@/types/notebook"
import type { SparkWithMeta } from "@/types/spark"
import type { TiptapJSON } from "@/types/notebook"

type NotebookEditorProps = {
  notebook: Notebook
}

export function NotebookEditor({ notebook }: NotebookEditorProps) {
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [selectedSpark, setSelectedSpark] = useState<SparkWithMeta | null>(null)
  const updateBody = useUpdateNotebookBody()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEditorUpdate = useCallback(
    (json: TiptapJSON) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        updateBody.mutate({ id: notebook.id, body: json })
      }, 800)
    },
    [notebook.id, updateBody],
  )

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", position: "relative", overflow: "hidden" }}>
      {/* Main Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <EditorToolbar
          notebookName={notebook.name}
          showRightPanel={showRightPanel}
          onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
        />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Editor area */}
          <div
            style={{
              flex: 1,
              padding: "32px 48px",
              overflow: "auto",
              fontFamily: T.font,
              color: T.text,
            }}
          >
            <div className="fade-in">
              <h1
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  marginBottom: 24,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  color: T.text,
                }}
              >
                {notebook.name}
              </h1>
              <RichEditor
                initialContent={notebook.body}
                onUpdate={handleEditorUpdate}
                placeholder="Start writing..."
              />
            </div>
          </div>

          {/* Raw Spark Viewer */}
          {selectedSpark && (
            <RawSparkViewer spark={selectedSpark} onClose={() => setSelectedSpark(null)} />
          )}
        </div>
      </div>

      {/* Right Panel */}
      {showRightPanel && (
        <RightPanel
          notebookId={notebook.id}
          onSparkClick={(spark) =>
            setSelectedSpark(selectedSpark?.rootId === spark.rootId ? null : spark)
          }
          selectedSparkRootId={selectedSpark?.rootId}
        />
      )}

      {/* AI Chat floating panel */}
      {showChat && (
        <AIChatPanel
          notebook={notebook}
          onClose={() => setShowChat(false)}
          showRightPanel={showRightPanel}
        />
      )}

      {/* Chat FAB */}
      <button
        onClick={() => setShowChat(!showChat)}
        style={{
          position: "absolute",
          bottom: 16,
          right: showRightPanel ? 276 : 16,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`,
          border: "none",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(167,139,250,0.3)",
          transition: "all 0.2s ease",
          zIndex: 20,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="AI Chat"
      >
        {showChat ? <XIcon /> : <ChatIcon />}
      </button>
    </div>
  )
}
