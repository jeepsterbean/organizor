import { T } from "@/styles/tokens"
import { HomeIcon, SparkIcon, InboxIcon, NotebookIcon, PlusIcon } from "@/components/shared/Icons"
import { useUnroutedSparks } from "@/hooks/useSparks"
import type { ActivePage } from "@/stores/uiStore"

type LeftSidebarProps = {
  activePage: ActivePage
  onNavigate: (page: ActivePage) => void
  onNewSpark: () => void
  onNewNotebook: () => void
}

const navItems: Array<{ id: ActivePage; icon: React.ReactNode; label: string }> = [
  { id: "home", icon: <HomeIcon />, label: "Home" },
  { id: "sparks", icon: <SparkIcon />, label: "All Sparks" },
  { id: "inbox", icon: <InboxIcon />, label: "Inbox" },
  { id: "notebooks", icon: <NotebookIcon />, label: "Notebooks" },
]

export function LeftSidebar({ activePage, onNavigate, onNewSpark, onNewNotebook }: LeftSidebarProps) {
  const { data: unrouted } = useUnroutedSparks()
  const unroutedCount = unrouted?.length ?? 0

  return (
    <div
      style={{
        width: 52,
        minWidth: 52,
        height: "100%",
        background: T.bg,
        borderRight: `1px solid ${T.borderSubtle}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 12,
        gap: 4,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: T.radius,
          background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          fontFamily: T.font,
          userSelect: "none",
        }}
      >
        O
      </div>

      {navItems.map((item) => (
        <NavButton
          key={item.id}
          active={activePage === item.id}
          label={item.label}
          onClick={() => onNavigate(item.id)}
          badge={item.id === "inbox" && unroutedCount > 0 ? unroutedCount : undefined}
        >
          {item.icon}
        </NavButton>
      ))}

      <div style={{ flex: 1 }} />

      {/* New Spark */}
      <ActionButton
        label="New Spark (⌘S)"
        bg={T.sparkSubtle}
        border={T.sparkBorder}
        color={T.spark}
        hoverBg="rgba(245,158,11,0.15)"
        onClick={onNewSpark}
      >
        <SparkIcon />
      </ActionButton>

      {/* New Notebook */}
      <ActionButton
        label="New Notebook"
        bg={T.accentSubtle}
        border={T.accentBorder}
        color={T.accent}
        hoverBg="rgba(167,139,250,0.15)"
        onClick={onNewNotebook}
        style={{ marginBottom: 12 }}
      >
        <PlusIcon />
      </ActionButton>
    </div>
  )
}

function NavButton({
  active,
  label,
  onClick,
  children,
  badge,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: T.radiusSm,
        background: active ? T.bgActive : "transparent",
        border: "none",
        color: active ? T.accent : T.textSecondary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.15s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = T.bgHover
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent"
      }}
    >
      {children}
      {badge !== undefined && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: T.spark,
          }}
        />
      )}
    </button>
  )
}

function ActionButton({
  label,
  bg,
  border,
  color,
  hoverBg,
  onClick,
  children,
  style,
}: {
  label: string
  bg: string
  border: string
  color: string
  hoverBg: string
  onClick: () => void
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: T.radiusSm,
        background: bg,
        border: `1px solid ${border}`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.15s ease",
        marginBottom: 4,
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = bg)}
    >
      {children}
    </button>
  )
}
