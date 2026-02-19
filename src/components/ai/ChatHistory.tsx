import { T } from "@/styles/tokens"
import { TrashIcon } from "@/components/shared/Icons"
import { useConversations, useDeleteConversation } from "@/hooks/useConversations"
import type { NotebookId } from "@/types/notebook"
import type { ConversationId } from "@/types/conversation"

type ChatHistoryProps = {
  notebookId: NotebookId
  onSelectConversation: (id: ConversationId) => void
}

export function ChatHistory({ notebookId, onSelectConversation }: ChatHistoryProps) {
  const { data: conversations } = useConversations(notebookId)
  const deleteConversation = useDeleteConversation()

  return (
    <div style={{ flex: 1, padding: 14, overflow: "auto", fontFamily: T.font }}>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          color: T.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 10,
        }}
      >
        Past Conversations
      </div>

      {(conversations ?? []).map((conv) => {
        const firstUserMessage = conv.messages.find((m) => m.role === "user")
        const preview = firstUserMessage?.content.slice(0, 60) ?? "New conversation"
        const date = new Date(conv.updatedAt).toLocaleDateString()

        return (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            style={{
              padding: "10px 12px",
              borderRadius: T.radiusSm,
              cursor: "pointer",
              marginBottom: 4,
              transition: "background 0.1s",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {preview}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                {conv.saved ? "saved · " : ""}{date}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteConversation.mutate({ id: conv.id, notebookId })
              }}
              style={{
                background: "none",
                border: "none",
                color: T.textMuted,
                cursor: "pointer",
                padding: 4,
                flexShrink: 0,
              }}
            >
              <TrashIcon size={12} />
            </button>
          </div>
        )
      })}

      {(!conversations || conversations.length === 0) && (
        <div style={{ fontSize: 13, color: T.textMuted, textAlign: "center", paddingTop: 20 }}>
          No past conversations
        </div>
      )}

      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 12, padding: "0 4px" }}>
        Unsaved conversations are removed after 30 days
      </div>
    </div>
  )
}
