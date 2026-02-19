import { useState } from "react"
import { T } from "@/styles/tokens"
import { InboxIcon, UploadIcon, ClockIcon } from "@/components/shared/Icons"
import { RoutingDropdown } from "@/components/spark/RoutingDropdown"
import { useUnroutedSparks, useRouteSpark } from "@/hooks/useSparks"
import type { SparkWithMeta } from "@/types/spark"
import type { NotebookId } from "@/types/notebook"

export function InboxPage() {
  const { data: unrouted } = useUnroutedSparks()
  const routeSpark = useRouteSpark()
  const [routingSparkRootId, setRoutingSparkRootId] = useState<string | null>(null)

  function handleRoute(spark: SparkWithMeta, notebookId: NotebookId | null) {
    if (!notebookId) return // null = keep in inbox, no-op
    routeSpark.mutate({ rootId: spark.rootId, notebookId })
    setRoutingSparkRootId(null)
  }

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
          alignItems: "center",
          gap: 12,
        }}
      >
        <InboxIcon />
        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text }}>Inbox</h2>
        {(unrouted?.length ?? 0) > 0 && (
          <span
            style={{
              fontSize: 11,
              padding: "2px 10px",
              borderRadius: 100,
              background: T.sparkSubtle,
              border: `1px solid ${T.sparkBorder}`,
              color: T.spark,
              fontWeight: 500,
            }}
          >
            {unrouted!.length} unrouted
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {(unrouted ?? []).length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: T.textMuted, fontSize: 14 }}>
            All sparks have been routed!
          </div>
        ) : (
          (unrouted ?? []).map((spark, i) => (
            <div
              key={spark.rootId}
              className="fade-in"
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${T.borderSubtle}`,
                animationDelay: `${i * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: T.text, marginBottom: 6 }}>
                    {spark.title ?? spark.content.slice(0, 80)}
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.7, color: T.textSecondary }}>
                    {spark.content}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.textMuted,
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ClockIcon /> {new Date(spark.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ position: "relative", flexShrink: 0 }}>
                  <button
                    onClick={() =>
                      setRoutingSparkRootId(
                        routingSparkRootId === spark.rootId ? null : spark.rootId,
                      )
                    }
                    style={{
                      padding: "6px 14px",
                      borderRadius: T.radiusSm,
                      whiteSpace: "nowrap",
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
                    <UploadIcon size={13} /> Route
                  </button>

                  {routingSparkRootId === spark.rootId && (
                    <RoutingDropdown
                      onRoute={(notebookId) => handleRoute(spark, notebookId)}
                      onClose={() => setRoutingSparkRootId(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
