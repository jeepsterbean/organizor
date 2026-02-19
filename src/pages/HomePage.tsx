import { useState } from "react"
import { T } from "@/styles/tokens"
import { SparkIcon, InboxIcon, NotebookIcon, ClockIcon, GridIcon, ListIcon, PlusIcon } from "@/components/shared/Icons"
import { useNotebooks, useCreateNotebook } from "@/hooks/useNotebooks"
import { useUnroutedSparks } from "@/hooks/useSparks"
import { useUIStore } from "@/stores/uiStore"

type ViewMode = "grid" | "list"

export function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const { data: notebooks } = useNotebooks()
  const { data: unrouted } = useUnroutedSparks()
  const openSparkCanvas = useUIStore((s) => s.openSparkCanvas)
  const openNotebookTab = useUIStore((s) => s.openNotebookTab)
  const navigateTo = useUIStore((s) => s.navigateTo)
  const createNotebook = useCreateNotebook()

  const unroutedCount = unrouted?.length ?? 0

  function handleNewNotebook() {
    const name = prompt("Notebook name:")
    if (!name?.trim()) return
    createNotebook.mutate(
      { name: name.trim() },
      { onSuccess: (nb) => openNotebookTab(nb.id, nb.name) },
    )
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: T.font, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${T.borderSubtle}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, color: T.text, flex: 1 }}>Home</h2>
        <button
          onClick={() => setViewMode("grid")}
          style={{
            width: 32,
            height: 32,
            borderRadius: T.radiusSm,
            background: viewMode === "grid" ? T.bgActive : "transparent",
            border: "none",
            color: viewMode === "grid" ? T.text : T.textMuted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GridIcon />
        </button>
        <button
          onClick={() => setViewMode("list")}
          style={{
            width: 32,
            height: 32,
            borderRadius: T.radiusSm,
            background: viewMode === "list" ? T.bgActive : "transparent",
            border: "none",
            color: viewMode === "list" ? T.text : T.textMuted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ListIcon />
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Quick actions */}
        <div style={{ padding: "16px 24px", display: "flex", gap: 12 }}>
          <QuickActionCard
            icon={<SparkIcon />}
            title="New Spark"
            subtitle="Capture a thought"
            color={T.spark}
            bg={T.sparkSubtle}
            border={T.sparkBorder}
            hoverBorder={T.spark}
            onClick={openSparkCanvas}
          />
          <QuickActionCard
            icon={<InboxIcon />}
            title="Inbox"
            subtitle="Route unprocessed sparks"
            badge={unroutedCount > 0 ? unroutedCount : undefined}
            color={T.text}
            bg={T.bgSurface}
            border={T.border}
            hoverBorder={T.textMuted}
            onClick={() => navigateTo("inbox")}
          />
          <QuickActionCard
            icon={<PlusIcon />}
            title="New Notebook"
            subtitle="Create a workspace"
            color={T.accent}
            bg={T.accentSubtle}
            border={T.accentBorder}
            hoverBorder={T.accent}
            onClick={handleNewNotebook}
          />
        </div>

        {/* Section label */}
        <div
          style={{
            padding: "0 24px 8px",
            fontSize: 10.5,
            fontWeight: 600,
            color: T.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Recent Notebooks
        </div>

        {/* Notebooks */}
        <div style={{ padding: "0 24px 24px" }}>
          {!notebooks || notebooks.length === 0 ? (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: T.textMuted,
                fontSize: 14,
              }}
            >
              No notebooks yet. Create your first one!
            </div>
          ) : viewMode === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {notebooks.map((nb, i) => (
                <div
                  key={nb.id}
                  className="fade-in"
                  onClick={() => openNotebookTab(nb.id, nb.name)}
                  style={{
                    padding: "18px 20px",
                    borderRadius: T.radius,
                    background: T.bgSurface,
                    border: `1px solid ${T.border}`,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    animationDelay: `${i * 40}ms`,
                    animationFillMode: "both",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.accentBorder
                    e.currentTarget.style.background = T.bgElevated
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border
                    e.currentTarget.style.background = T.bgSurface
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 500, color: T.text, marginBottom: 8 }}>
                    {nb.name}
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: T.textMuted }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <ClockIcon /> {formatDate(nb.updatedAt)}
                    </span>
                  </div>
                  {nb.parentNotebookId && (
                    <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>
                      sub-notebook
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {notebooks.map((nb, i) => (
                <div
                  key={nb.id}
                  className="fade-in"
                  onClick={() => openNotebookTab(nb.id, nb.name)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${T.borderSubtle}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "background 0.1s",
                    animationDelay: `${i * 30}ms`,
                    animationFillMode: "both",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <NotebookIcon size={16} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.text }}>{nb.name}</span>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{formatDate(nb.updatedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({
  icon,
  title,
  subtitle,
  badge,
  color,
  bg,
  border,
  hoverBorder,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  badge?: number
  color: string
  bg: string
  border: string
  hoverBorder: string
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: "16px 20px",
        borderRadius: T.radius,
        background: bg,
        border: `1px solid ${border}`,
        cursor: "pointer",
        transition: "border-color 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = hoverBorder)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 500, color }}>{title}</span>
        {badge !== undefined && badge > 0 && (
          <span
            style={{
              fontSize: 11,
              padding: "1px 7px",
              borderRadius: 100,
              background: T.sparkSubtle,
              color: T.spark,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: T.textMuted }}>{subtitle}</div>
    </div>
  )
}

function formatDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
