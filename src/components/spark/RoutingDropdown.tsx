import { useState } from "react"
import { T } from "@/styles/tokens"
import { SearchIcon, InboxIcon, NotebookIcon } from "@/components/shared/Icons"
import { useNotebooks } from "@/hooks/useNotebooks"
import type { NotebookId } from "@/types/notebook"

type RoutingDropdownProps = {
  onRoute: (notebookId: NotebookId | null) => void
  onClose: () => void
}

export function RoutingDropdown({ onRoute, onClose }: RoutingDropdownProps) {
  const [search, setSearch] = useState("")
  const { data: notebooks } = useNotebooks()

  const filtered = (notebooks ?? []).filter((nb) =>
    nb.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div
      className="scale-in"
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: 4,
        width: 300,
        borderRadius: T.radius,
        background: T.bgSurface,
        border: `1px solid ${T.border}`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      <div style={{ padding: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
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
            autoFocus
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
      </div>

      <div style={{ maxHeight: 260, overflow: "auto" }}>
        {/* Inbox option */}
        <div
          onClick={() => {
            onRoute(null)
            onClose()
          }}
          style={{
            padding: "10px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `1px solid ${T.borderSubtle}`,
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <InboxIcon size={16} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.spark }}>Send to Inbox</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Route later</div>
          </div>
        </div>

        {filtered.length > 0 && (
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "10px 16px 6px",
            }}
          >
            Notebooks
          </div>
        )}

        {filtered.map((nb) => (
          <div
            key={nb.id}
            onClick={() => {
              onRoute(nb.id)
              onClose()
            }}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: T.text,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <NotebookIcon size={14} />
            {nb.name}
          </div>
        ))}

        {filtered.length === 0 && search && (
          <div style={{ padding: "12px 16px", fontSize: 13, color: T.textMuted, textAlign: "center" }}>
            No notebooks match "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
