import { T } from "@/styles/tokens"
import { ClockIcon, SparkIcon } from "@/components/shared/Icons"
import type { SparkWithMeta } from "@/types/spark"

type SparkCardProps = {
  spark: SparkWithMeta
  isSelected?: boolean
  notebookName?: string
  onClick: () => void
  animationDelay?: number
}

export function SparkCard({ spark, isSelected, notebookName, onClick, animationDelay = 0 }: SparkCardProps) {
  const relativeTime = formatRelativeTime(spark.updatedAt)

  return (
    <div
      className="fade-in"
      onClick={onClick}
      style={{
        padding: "14px 20px",
        borderBottom: `1px solid ${T.borderSubtle}`,
        cursor: "pointer",
        transition: "background 0.1s",
        background: isSelected ? T.bgActive : "transparent",
        animationDelay: `${animationDelay}ms`,
        animationFillMode: "both",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = T.bgHover
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = "transparent"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: T.text, flex: 1 }}>
          {spark.title ?? spark.content.slice(0, 60)}
        </span>
        {spark.routingStatus === "routed" && notebookName ? (
          <span
            style={{
              fontSize: 10.5,
              padding: "2px 8px",
              borderRadius: 100,
              background: T.accentSubtle,
              border: `1px solid ${T.accentBorder}`,
              color: T.accent,
              whiteSpace: "nowrap",
            }}
          >
            {notebookName}
          </span>
        ) : (
          <span
            style={{
              fontSize: 10.5,
              padding: "2px 8px",
              borderRadius: 100,
              background: T.sparkSubtle,
              border: `1px solid ${T.sparkBorder}`,
              color: T.spark,
              whiteSpace: "nowrap",
            }}
          >
            Inbox
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 12.5,
          color: T.textMuted,
          lineHeight: 1.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {spark.content}
      </div>

      <div
        style={{
          fontSize: 11,
          color: T.textMuted,
          marginTop: 6,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <ClockIcon /> {relativeTime}
      </div>
    </div>
  )
}

// Simple inline compact card for right panel
export function SparkCompactCard({
  spark,
  isSelected,
  onClick,
}: {
  spark: SparkWithMeta
  isSelected?: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 10px",
        borderRadius: T.radiusSm,
        cursor: "pointer",
        transition: "background 0.1s",
        border: isSelected ? `1px solid ${T.sparkBorder}` : "1px solid transparent",
        background: isSelected ? T.sparkSubtle : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = T.bgHover
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = "transparent"
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 4 }}>
        <SparkIcon size={12} />
        {" "}
        {spark.title ?? spark.content.slice(0, 40)}
      </div>
      <div style={{ fontSize: 11.5, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
        <ClockIcon /> {formatRelativeTime(spark.updatedAt)}
      </div>
    </div>
  )
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now()
  const past = new Date(isoString).getTime()
  const diff = now - past

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(isoString).toLocaleDateString()
}
