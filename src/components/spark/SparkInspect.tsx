import { useState } from "react"
import { T } from "@/styles/tokens"
import { SparkIcon, XIcon, UploadIcon, BranchIcon, ClockIcon, TrashIcon } from "@/components/shared/Icons"
import { RoutingDropdown } from "./RoutingDropdown"
import { useEditSpark, useRouteSpark, useUnrouteSpark, useDeleteSpark, useSparkHistory } from "@/hooks/useSparks"
import { useUIStore } from "@/stores/uiStore"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import type { SparkWithMeta } from "@/types/spark"
import type { NotebookId } from "@/types/notebook"

type SparkInspectProps = {
  spark: SparkWithMeta
  notebookName?: string
  onClose: () => void
  onOpenNotebook?: (id: NotebookId) => void
}

export function SparkInspect({ spark, notebookName, onClose, onOpenNotebook }: SparkInspectProps) {
  const [showRoutingDropdown, setShowRoutingDropdown] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editedContent, setEditedContent] = useState(spark.content)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState<"content" | "history">("content")

  const editSpark = useEditSpark()
  const routeSpark = useRouteSpark()
  const unrouteSpark = useUnrouteSpark()
  const deleteSpark = useDeleteSpark()
  const { data: history } = useSparkHistory(activeTab === "history" ? spark.rootId : null)
  const openNotebookTab = useUIStore((s) => s.openNotebookTab)

  function handleSave() {
    if (!isDirty || !editedContent.trim()) return
    editSpark.mutate({ rootId: spark.rootId, content: editedContent.trim() })
    setIsDirty(false)
  }

  function handleRoute(notebookId: NotebookId | null) {
    if (notebookId) {
      routeSpark.mutate({ rootId: spark.rootId, notebookId })
    } else {
      unrouteSpark.mutate(spark.rootId)
    }
    setShowRoutingDropdown(false)
  }

  function handleDelete() {
    deleteSpark.mutate(spark.rootId, { onSuccess: onClose })
  }

  function handleOpenNotebook() {
    if (!spark.notebookId) return
    if (onOpenNotebook) {
      onOpenNotebook(spark.notebookId)
    } else {
      openNotebookTab(spark.notebookId, notebookName ?? "Notebook")
    }
  }

  return (
    <div
      className="slide-right"
      style={{
        width: "50%",
        borderLeft: `1px solid ${T.borderSubtle}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: T.font,
        background: T.bgSurface,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 44,
          borderBottom: `1px solid ${T.borderSubtle}`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
        }}
      >
        <SparkIcon size={16} />
        <span style={{ fontSize: 13, fontWeight: 500, color: T.spark, flex: 1 }}>Spark Inspector</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}
        >
          <XIcon />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.borderSubtle}` }}>
        {(["content", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "8px 0",
              fontSize: 12,
              fontWeight: 500,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: activeTab === tab ? T.text : T.textMuted,
              borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent",
              fontFamily: T.font,
              textTransform: "capitalize",
              transition: "all 0.15s ease",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
        {activeTab === "content" && (
          <>
            <textarea
              defaultValue={spark.content}
              onChange={(e) => {
                setEditedContent(e.target.value)
                setIsDirty(true)
              }}
              style={{
                width: "100%",
                minHeight: 200,
                background: "transparent",
                border: "none",
                fontSize: 14.5,
                lineHeight: 1.75,
                color: T.textSecondary,
                fontFamily: T.font,
                outline: "none",
                resize: "none",
              }}
            />

            {isDirty && (
              <button
                onClick={handleSave}
                disabled={editSpark.isPending}
                style={{
                  marginBottom: 16,
                  padding: "6px 14px",
                  borderRadius: T.radiusSm,
                  background: T.accent,
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: T.font,
                  cursor: "pointer",
                }}
              >
                {editSpark.isPending ? "Saving…" : "Save changes"}
              </button>
            )}

            {/* Metadata */}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: T.radius,
                background: T.bgActive,
                border: `1px solid ${T.borderSubtle}`,
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: T.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                Metadata
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: T.textSecondary,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <Row label="Created" value={new Date(spark.createdAt).toLocaleString()} />
                <Row
                  label="Status"
                  value={spark.routingStatus === "routed" ? "Routed" : "Unrouted"}
                  valueStyle={{ color: spark.routingStatus === "routed" ? T.success : T.spark }}
                />
                {spark.routingStatus === "routed" && notebookName && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Notebook</span>
                    <span
                      onClick={handleOpenNotebook}
                      style={{ color: T.accent, cursor: "pointer" }}
                    >
                      {notebookName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Connections placeholder */}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: T.radius,
                border: `1px dashed ${T.border}`,
                textAlign: "center",
              }}
            >
              <BranchIcon size={18} />
              <div style={{ fontSize: 12.5, color: T.textMuted, marginTop: 8 }}>
                Spark version tree
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
              <button
                onClick={() => setShowRoutingDropdown(!showRoutingDropdown)}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: T.radiusSm,
                  background: T.sparkSubtle,
                  border: `1px solid ${T.sparkBorder}`,
                  color: T.spark,
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: T.font,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <UploadIcon /> {spark.routingStatus === "routed" ? "Change routing" : "Route to Notebook"}
              </button>

              {showRoutingDropdown && (
                <div style={{ position: "relative" }}>
                  <RoutingDropdown
                    onRoute={handleRoute}
                    onClose={() => setShowRoutingDropdown(false)}
                  />
                </div>
              )}

              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  width: "100%",
                  padding: "8px 0",
                  borderRadius: T.radiusSm,
                  background: "transparent",
                  border: `1px solid ${T.borderSubtle}`,
                  color: T.textMuted,
                  fontSize: 12,
                  fontFamily: T.font,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <TrashIcon /> Delete spark
              </button>
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Version history
            </div>
            {(history ?? []).map((version, i) => (
              <div
                key={version.id}
                style={{
                  padding: 12,
                  borderRadius: T.radiusSm,
                  background: i === 0 ? T.bgActive : "transparent",
                  border: `1px solid ${i === 0 ? T.border : T.borderSubtle}`,
                }}
              >
                <div style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                  <ClockIcon />
                  {new Date(version.createdAt).toLocaleString()}
                  {i === 0 && (
                    <span style={{ marginLeft: 6, color: T.accent, fontWeight: 500 }}>current</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.65 }}>{version.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete spark?"
          message="This will permanently delete all versions of this spark."
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

function Row({
  label,
  value,
  valueStyle,
}: {
  label: string
  value: string
  valueStyle?: React.CSSProperties
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{label}</span>
      <span style={{ color: T.text, ...valueStyle }}>{value}</span>
    </div>
  )
}
