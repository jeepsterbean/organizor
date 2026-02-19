import { T } from "@/styles/tokens"
import { XIcon, PlusIcon } from "@/components/shared/Icons"
import type { OpenTab } from "@/stores/uiStore"
import type { NotebookId } from "@/types/notebook"

type TopTabBarProps = {
  tabs: OpenTab[]
  activeTabId: NotebookId | null
  onTabClick: (id: NotebookId) => void
  onTabClose: (id: NotebookId) => void
  onAddTab: () => void
}

export function TopTabBar({ tabs, activeTabId, onTabClick, onTabClose, onAddTab }: TopTabBarProps) {
  return (
    <div
      style={{
        height: 40,
        background: T.bg,
        borderBottom: `1px solid ${T.borderSubtle}`,
        display: "flex",
        alignItems: "stretch",
        paddingLeft: 4,
        gap: 1,
        fontFamily: T.font,
        fontSize: 12.5,
        overflow: "hidden",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
              cursor: "pointer",
              background: isActive ? T.bgSurface : "transparent",
              color: isActive ? T.text : T.textSecondary,
              borderBottom: isActive ? `2px solid ${T.accent}` : "2px solid transparent",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
              maxWidth: 180,
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tab.label}</span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.5,
                transition: "opacity 0.1s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
            >
              <XIcon size={14} />
            </span>
          </div>
        )
      })}

      <button
        onClick={onAddTab}
        style={{
          width: 32,
          height: "100%",
          background: "transparent",
          border: "none",
          color: T.textMuted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title="Browse notebooks"
      >
        <PlusIcon />
      </button>
    </div>
  )
}
