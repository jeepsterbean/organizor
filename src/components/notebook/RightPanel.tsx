import { useState } from "react"
import { T } from "@/styles/tokens"
import { FolderIcon, NotebookIcon, LinkIcon, SparkIcon } from "@/components/shared/Icons"
import { SparkCompactCard } from "@/components/spark/SparkCard"
import { useNotebookWithRelations, useNotebooks } from "@/hooks/useNotebooks"
import { useNotebookSparks } from "@/hooks/useSparks"
import { useUIStore } from "@/stores/uiStore"
import type { NotebookId } from "@/types/notebook"
import type { SparkWithMeta } from "@/types/spark"

type RightPanelTab = "meta" | "sparks"

type RightPanelProps = {
  notebookId: NotebookId
  onSparkClick: (spark: SparkWithMeta) => void
  selectedSparkRootId?: string | null
}

export function RightPanel({ notebookId, onSparkClick, selectedSparkRootId }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>("meta")
  const { data: notebookWithRelations } = useNotebookWithRelations(notebookId)
  const { data: notebooks } = useNotebooks()
  const { data: sparks } = useNotebookSparks(notebookId)
  const openNotebookTab = useUIStore((s) => s.openNotebookTab)

  const notebookMap = new Map((notebooks ?? []).map((nb) => [nb.id, nb]))

  const parentNotebook = notebookWithRelations?.parentNotebookId
    ? notebookMap.get(notebookWithRelations.parentNotebookId)
    : null

  const childNotebooks = (notebookWithRelations?.childIds ?? [])
    .map((id) => notebookMap.get(id))
    .filter(Boolean)

  const referencedNotebooks = (notebookWithRelations?.referenceIds ?? [])
    .map((id) => notebookMap.get(id))
    .filter(Boolean)

  return (
    <div
      className="slide-right"
      style={{
        width: 260,
        borderLeft: `1px solid ${T.borderSubtle}`,
        background: T.bgSurface,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: T.font,
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.borderSubtle}` }}>
        {([
          { id: "meta" as const, label: "Metadata" },
          { id: "sparks" as const, label: "Sparks" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 12,
              fontWeight: 500,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: activeTab === tab.id ? T.text : T.textMuted,
              borderBottom: activeTab === tab.id ? `2px solid ${T.accent}` : "2px solid transparent",
              fontFamily: T.font,
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
        {activeTab === "meta" && (
          <div className="fade-in">
            {parentNotebook && (
              <Section title="Parent">
                <NotebookLink
                  name={parentNotebook.name}
                  icon={<FolderIcon />}
                  onClick={() => openNotebookTab(parentNotebook.id, parentNotebook.name)}
                />
              </Section>
            )}

            {childNotebooks.length > 0 && (
              <Section title={`Children (${childNotebooks.length})`}>
                {childNotebooks.map((nb) =>
                  nb ? (
                    <NotebookLink
                      key={nb.id}
                      name={nb.name}
                      icon={<NotebookIcon size={14} />}
                      onClick={() => openNotebookTab(nb.id, nb.name)}
                    />
                  ) : null,
                )}
              </Section>
            )}

            <Section title={`References (${referencedNotebooks.length})`}>
              {referencedNotebooks.length === 0 ? (
                <div style={{ fontSize: 12.5, color: T.textMuted, padding: "4px 0" }}>No references</div>
              ) : (
                referencedNotebooks.map((nb) =>
                  nb ? (
                    <NotebookLink
                      key={nb.id}
                      name={nb.name}
                      icon={<LinkIcon />}
                      onClick={() => openNotebookTab(nb.id, nb.name)}
                    />
                  ) : null,
                )
              )}
            </Section>

            <Section title="Info">
              <div style={{ fontSize: 12.5, color: T.textSecondary, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Sparks</span>
                  <span style={{ color: T.text }}>{notebookWithRelations?.sparkCount ?? 0}</span>
                </div>
                {notebookWithRelations && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Updated</span>
                    <span style={{ color: T.text }}>
                      {new Date(notebookWithRelations.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Section>
          </div>
        )}

        {activeTab === "sparks" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              Raw Sparks ({sparks?.length ?? 0})
            </div>
            {(sparks ?? []).map((spark) => (
              <SparkCompactCard
                key={spark.rootId}
                spark={spark}
                isSelected={selectedSparkRootId === spark.rootId}
                onClick={() => onSparkClick(spark)}
              />
            ))}
            {(!sparks || sparks.length === 0) && (
              <div style={{ fontSize: 12.5, color: T.textMuted, padding: "8px 0" }}>
                No sparks routed to this notebook yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
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
        {title}
      </div>
      {children}
    </div>
  )
}

function NotebookLink({ name, icon, onClick }: { name: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "7px 10px",
        borderRadius: T.radiusSm,
        cursor: "pointer",
        fontSize: 13,
        color: T.text,
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {icon} {name}
    </div>
  )
}
