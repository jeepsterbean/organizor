import { useState } from "react"
import { T } from "@/styles/tokens"
import { SearchIcon } from "@/components/shared/Icons"
import { SparkCard } from "@/components/spark/SparkCard"
import { SparkInspect } from "@/components/spark/SparkInspect"
import { useAllSparks } from "@/hooks/useSparks"
import { useNotebooks } from "@/hooks/useNotebooks"
import { useUIStore } from "@/stores/uiStore"
import type { SparkWithMeta } from "@/types/spark"

type SparkFilter = "all" | "routed" | "unrouted"

export function SparksPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<SparkFilter>("all")
  const [selectedSpark, setSelectedSpark] = useState<SparkWithMeta | null>(null)

  const { data: sparks } = useAllSparks()
  const { data: notebooks } = useNotebooks()
  const openNotebookTab = useUIStore((s) => s.openNotebookTab)

  const notebookMap = new Map((notebooks ?? []).map((nb) => [nb.id, nb]))

  const filtered = (sparks ?? [])
    .filter((s) => {
      if (filter === "routed") return s.routingStatus === "routed"
      if (filter === "unrouted") return s.routingStatus === "unrouted"
      return true
    })
    .filter((s) => {
      const q = search.toLowerCase()
      return (
        s.content.toLowerCase().includes(q) ||
        (s.title ?? "").toLowerCase().includes(q)
      )
    })

  function handleSelectSpark(spark: SparkWithMeta) {
    setSelectedSpark(selectedSpark?.rootId === spark.rootId ? null : spark)
  }

  const selectedNotebook = selectedSpark?.notebookId
    ? notebookMap.get(selectedSpark.notebookId)
    : null

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", fontFamily: T.font }}>
      {/* Spark List */}
      <div
        style={{
          width: selectedSpark ? "50%" : "100%",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease",
          overflow: "hidden",
          borderRight: selectedSpark ? `1px solid ${T.borderSubtle}` : "none",
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
          <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text }}>All Sparks</h2>
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
                placeholder="Search sparks..."
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
            {(["all", "routed", "unrouted"] as SparkFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 12px",
                  borderRadius: T.radiusSm,
                  fontSize: 12,
                  fontWeight: 500,
                  background: filter === f ? T.bgActive : "transparent",
                  border: filter === f ? `1px solid ${T.border}` : "1px solid transparent",
                  color: filter === f ? T.text : T.textMuted,
                  cursor: "pointer",
                  fontFamily: T.font,
                  textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: T.textMuted, fontSize: 14 }}>
              {search ? `No sparks match "${search}"` : "No sparks yet"}
            </div>
          ) : (
            filtered.map((spark, i) => (
              <SparkCard
                key={spark.rootId}
                spark={spark}
                isSelected={selectedSpark?.rootId === spark.rootId}
                notebookName={spark.notebookId ? notebookMap.get(spark.notebookId)?.name : undefined}
                onClick={() => handleSelectSpark(spark)}
                animationDelay={i * 30}
              />
            ))
          )}
        </div>
      </div>

      {/* Spark Inspect Panel */}
      {selectedSpark && (
        <SparkInspect
          spark={selectedSpark}
          notebookName={selectedNotebook?.name}
          onClose={() => setSelectedSpark(null)}
          onOpenNotebook={(id) => {
            const nb = notebookMap.get(id)
            if (nb) openNotebookTab(nb.id, nb.name)
          }}
        />
      )}
    </div>
  )
}
