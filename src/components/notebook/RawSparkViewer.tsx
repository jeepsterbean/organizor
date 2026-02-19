import { T } from "@/styles/tokens"
import { SparkIcon, XIcon } from "@/components/shared/Icons"
import type { SparkWithMeta } from "@/types/spark"

type RawSparkViewerProps = {
  spark: SparkWithMeta
  onClose: () => void
}

export function RawSparkViewer({ spark, onClose }: RawSparkViewerProps) {
  return (
    <div
      className="slide-right"
      style={{
        width: 320,
        borderLeft: `1px solid ${T.borderSubtle}`,
        background: T.bgSurface,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: T.font,
      }}
    >
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
        <span style={{ fontSize: 12.5, fontWeight: 500, color: T.spark, flex: 1 }}>Raw Spark</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}
        >
          <XIcon />
        </button>
      </div>
      <div style={{ flex: 1, padding: 16, overflow: "auto" }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: T.text, marginBottom: 12 }}>
          {spark.title ?? spark.content.slice(0, 60)}
        </h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.textSecondary }}>{spark.content}</p>
        <div
          style={{
            marginTop: 16,
            padding: "8px 12px",
            borderRadius: T.radiusSm,
            background: T.bgActive,
            fontSize: 11.5,
            color: T.textMuted,
            fontFamily: T.fontMono,
          }}
        >
          {new Date(spark.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
