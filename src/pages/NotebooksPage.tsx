import { useState } from "react"
import { T } from "@/styles/tokens"
import { SearchIcon, NotebookIcon, ListIcon, MindmapIcon, ChevronRightIcon, PlusIcon } from "@/components/shared/Icons"
import { useNotebooks, useCreateNotebook } from "@/hooks/useNotebooks"
import { useUIStore } from "@/stores/uiStore"
import type { Notebook } from "@/types/notebook"

type ViewMode = "list" | "mindmap"

export function NotebooksPage() {
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const { data: notebooks } = useNotebooks()
  const openNotebookTab = useUIStore((s) => s.openNotebookTab)
  const createNotebook = useCreateNotebook()

  function handleNewNotebook() {
    const name = prompt("Notebook name:")
    if (!name?.trim()) return
    createNotebook.mutate(
      { name: name.trim() },
      { onSuccess: (nb) => openNotebookTab(nb.id, nb.name) },
    )
  }

  const filtered = (notebooks ?? []).filter((nb) =>
    nb.name.toLowerCase().includes(search.toLowerCase()),
  )

  const notebookMap = new Map((notebooks ?? []).map((nb) => [nb.id, nb]))

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        fontFamily: T.font,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${T.borderSubtle}`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text, flex: 1 }}>Notebooks</h2>
          <button
            onClick={handleNewNotebook}
            style={{
              padding: "6px 12px",
              borderRadius: T.radiusSm,
              background: T.accentSubtle,
              border: `1px solid ${T.accentBorder}`,
              color: T.accent,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: T.font,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <PlusIcon size={14} /> New
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: T.radiusSm,
              background: T.bgActive,
              border: `1px solid ${T.borderSubtle}`,
            }}
          >
            <SearchIcon />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notebooks..."
              style={{
                background: "transparent",
                border: "none",
                flex: 1,
                color: T.text,
                fontSize: 13,
                fontFamily: T.font,
                outline: "none",
              }}
            />
          </div>
          {([
            { id: "list" as const, icon: <ListIcon />, label: "List" },
            { id: "mindmap" as const, icon: <MindmapIcon />, label: "Mindmap" },
          ]).map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              title={v.label}
              style={{
                width: 32,
                height: 32,
                borderRadius: T.radiusSm,
                background: viewMode === v.id ? T.bgActive : "transparent",
                border: viewMode === v.id ? `1px solid ${T.border}` : "1px solid transparent",
                color: viewMode === v.id ? T.text : T.textMuted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: T.textMuted, fontSize: 14 }}>
            {search ? `No notebooks match "${search}"` : "No notebooks yet. Create your first one!"}
          </div>
        ) : viewMode === "list" ? (
          filtered.map((nb, i) => (
            <div
              key={nb.id}
              className="fade-in"
              onClick={() => openNotebookTab(nb.id, nb.name)}
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${T.borderSubtle}`,
                cursor: "pointer",
                transition: "background 0.1s",
                display: "flex",
                alignItems: "center",
                gap: 12,
                animationDelay: `${i * 30}ms`,
                animationFillMode: "both",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <NotebookIcon size={16} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{nb.name}</div>
                {nb.parentNotebookId && (
                  <div style={{ fontSize: 11.5, color: T.textMuted, marginTop: 2 }}>
                    in {notebookMap.get(nb.parentNotebookId)?.name ?? "..."}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 12, color: T.textMuted }}>
                {new Date(nb.updatedAt).toLocaleDateString()}
              </span>
              <ChevronRightIcon />
            </div>
          ))
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 48,
              height: "100%",
            }}
          >
            <MindmapView notebooks={filtered} onOpenNotebook={(id) => {
              const nb = notebookMap.get(id)
              if (nb) openNotebookTab(nb.id, nb.name)
            }} />
          </div>
        )}
      </div>
    </div>
  )
}

function MindmapView({
  notebooks,
  onOpenNotebook,
}: {
  notebooks: Notebook[]
  onOpenNotebook: (id: string) => void
}) {
  const cx = 400
  const cy = 250
  const rootNbs = notebooks.filter((n) => !n.parentNotebookId)
  const childNbs = notebooks.filter((n) => n.parentNotebookId)

  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="800" height="500" viewBox="0 0 800 500" style={{ overflow: "visible" }}>
        {rootNbs.map((nb, i) => {
          const angle = (i / Math.max(rootNbs.length, 1)) * Math.PI * 2 - Math.PI / 2
          const x = cx + Math.cos(angle) * 160
          const y = cy + Math.sin(angle) * 120
          const children = childNbs.filter((c) => c.parentNotebookId === nb.id)

          return (
            <g key={nb.id}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={T.border} strokeWidth="1.5" />
              {children.map((child, ci) => {
                const cAngle = angle + (ci - (children.length - 1) / 2) * 0.4
                const cx2 = cx + Math.cos(cAngle) * 280
                const cy2 = cy + Math.sin(cAngle) * 200
                return (
                  <g key={child.id}>
                    <line
                      x1={x}
                      y1={y}
                      x2={cx2}
                      y2={cy2}
                      stroke={T.borderSubtle}
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx={cx2}
                      cy={cy2}
                      r="24"
                      fill={T.bgSurface}
                      stroke={T.border}
                      strokeWidth="1"
                      style={{ cursor: "pointer" }}
                      onClick={() => onOpenNotebook(child.id)}
                    />
                    <text
                      x={cx2}
                      y={cy2 + 40}
                      textAnchor="middle"
                      fill={T.textMuted}
                      fontSize="11"
                      fontFamily={T.font}
                    >
                      {child.name.slice(0, 14)}
                    </text>
                  </g>
                )
              })}
              <circle
                cx={x}
                cy={y}
                r="32"
                fill={T.bgSurface}
                stroke={T.accentBorder}
                strokeWidth="1.5"
                style={{ cursor: "pointer" }}
                onClick={() => onOpenNotebook(nb.id)}
              />
              <text
                x={x}
                y={y + 48}
                textAnchor="middle"
                fill={T.text}
                fontSize="12"
                fontFamily={T.font}
                fontWeight="500"
              >
                {nb.name.slice(0, 16)}
              </text>
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r="20" fill={T.accent} opacity="0.2" />
        <circle cx={cx} cy={cy} r="8" fill={T.accent} />
      </svg>
    </div>
  )
}
