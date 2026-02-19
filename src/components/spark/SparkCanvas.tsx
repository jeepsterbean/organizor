import { useState, useRef, useEffect } from "react"
import { T } from "@/styles/tokens"
import { ArrowLeftIcon, SparkIcon, UploadIcon } from "@/components/shared/Icons"
import { RoutingDropdown } from "./RoutingDropdown"
import { useCreateSpark } from "@/hooks/useSparks"
import type { NotebookId } from "@/types/notebook"

type SparkCanvasProps = {
  onClose: () => void
}

export function SparkCanvas({ onClose }: SparkCanvasProps) {
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [showRoutingDropdown, setShowRoutingDropdown] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const createSpark = useCreateSpark()

  useEffect(() => {
    textRef.current?.focus()
  }, [])

  function handleRoute(notebookId: NotebookId | null) {
    if (!content.trim()) return

    createSpark.mutate(
      {
        content: content.trim(),
        title: title.trim() || undefined,
        notebookId: notebookId ?? undefined,
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  function handleSaveToInbox() {
    if (!content.trim()) return
    handleRoute(null)
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: T.bg,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        fontFamily: T.font,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          borderBottom: `1px solid ${T.borderSubtle}`,
          gap: 12,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: T.textSecondary,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: T.font,
            fontSize: 13,
          }}
        >
          <ArrowLeftIcon /> Back
        </button>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: T.spark }}>
          <SparkIcon />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Spark Canvas</span>
        </div>

        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          <button
            onClick={handleSaveToInbox}
            disabled={!content.trim() || createSpark.isPending}
            style={{
              padding: "6px 14px",
              borderRadius: T.radiusSm,
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.textSecondary,
              fontSize: 12.5,
              fontWeight: 500,
              fontFamily: T.font,
              cursor: "pointer",
              opacity: !content.trim() ? 0.4 : 1,
            }}
          >
            Save to Inbox
          </button>
          <button
            onClick={() => setShowRoutingDropdown(!showRoutingDropdown)}
            disabled={!content.trim() || createSpark.isPending}
            style={{
              padding: "6px 14px",
              borderRadius: T.radiusSm,
              background: T.sparkSubtle,
              border: `1px solid ${T.sparkBorder}`,
              color: T.spark,
              fontSize: 12.5,
              fontWeight: 500,
              fontFamily: T.font,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: !content.trim() ? 0.4 : 1,
            }}
          >
            <UploadIcon /> Route to Notebook
          </button>

          {showRoutingDropdown && (
            <RoutingDropdown
              onRoute={handleRoute}
              onClose={() => setShowRoutingDropdown(false)}
            />
          )}
        </div>
      </div>

      {/* Writing Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          overflow: "auto",
          padding: "48px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 680 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Spark title (optional)"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              fontSize: 26,
              fontWeight: 500,
              color: T.text,
              fontFamily: T.font,
              outline: "none",
              marginBottom: 24,
              letterSpacing: "-0.01em",
            }}
          />
          <textarea
            ref={textRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts..."
            style={{
              width: "100%",
              minHeight: 400,
              background: "transparent",
              border: "none",
              fontSize: 16,
              lineHeight: 1.8,
              color: T.textSecondary,
              fontFamily: T.font,
              outline: "none",
              resize: "none",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: `1px solid ${T.borderSubtle}`,
          fontSize: 11,
          color: T.textMuted,
          fontFamily: T.fontMono,
          gap: 16,
        }}
      >
        <span>{wordCount} words</span>
        {createSpark.isPending && <span style={{ color: T.accent }}>Saving…</span>}
        {createSpark.isError && <span style={{ color: T.danger }}>Failed to save</span>}
      </div>
    </div>
  )
}
