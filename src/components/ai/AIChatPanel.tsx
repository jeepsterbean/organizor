import { useState, useRef, useEffect } from "react"
import { T } from "@/styles/tokens"
import { ChatIcon, HistoryIcon, SaveIcon, XIcon, SendIcon } from "@/components/shared/Icons"
import { ChatMessage } from "./ChatMessage"
import { ChatHistory } from "./ChatHistory"
import { useActiveConversation, useSendMessage, useSaveConversation, useConversations } from "@/hooks/useConversations"
import type { Notebook } from "@/types/notebook"
import type { ConversationId } from "@/types/conversation"

type AIChatPanelProps = {
  notebook: Notebook
  onClose: () => void
  showRightPanel: boolean
}

export function AIChatPanel({ notebook, onClose, showRightPanel }: AIChatPanelProps) {
  const [input, setInput] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<ConversationId | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: activeConversation } = useActiveConversation(notebook.id)
  const { data: conversations } = useConversations(notebook.id)
  const sendMessage = useSendMessage()
  const saveConversation = useSaveConversation()

  // Use the selected conversation or the active one
  const displayConversation = activeConversationId
    ? conversations?.find((c) => c.id === activeConversationId) ?? activeConversation
    : activeConversation

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayConversation?.messages])

  function handleSend() {
    if (!input.trim() || !displayConversation) return
    const content = input.trim()
    setInput("")

    sendMessage.mutate({
      conversationId: displayConversation.id,
      content,
      context: {
        notebookName: notebook.name,
        notebookBody: notebook.body ? JSON.stringify(notebook.body) : undefined,
      },
      previousMessages: displayConversation.messages,
      notebookId: notebook.id,
    })
  }

  return (
    <div
      className="scale-in"
      style={{
        position: "absolute",
        bottom: 72,
        right: showRightPanel ? 276 : 16,
        width: 380,
        height: 480,
        borderRadius: T.radiusLg,
        background: T.bgSurface,
        border: `1px solid ${T.border}`,
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: T.font,
        zIndex: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 46,
          borderBottom: `1px solid ${T.borderSubtle}`,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 8,
        }}
      >
        <ChatIcon size={16} />
        <span style={{ fontSize: 13, fontWeight: 500, color: T.text, flex: 1 }}>AI Chat</span>
        <button
          onClick={() => setShowHistory(!showHistory)}
          title="Past conversations"
          style={{
            background: "none",
            border: "none",
            color: showHistory ? T.accent : T.textMuted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontFamily: T.font,
          }}
        >
          <HistoryIcon /> History
        </button>
        {displayConversation && !displayConversation.saved && (
          <button
            onClick={() =>
              saveConversation.mutate({ id: displayConversation.id, notebookId: notebook.id })
            }
            title="Save conversation"
            style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}
          >
            <SaveIcon />
          </button>
        )}
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}
        >
          <XIcon />
        </button>
      </div>

      {showHistory ? (
        <ChatHistory
          notebookId={notebook.id}
          onSelectConversation={(id) => {
            setActiveConversationId(id)
            setShowHistory(false)
          }}
        />
      ) : (
        <>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: 14,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {(displayConversation?.messages ?? []).map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {sendMessage.isPending && (
              <div style={{ alignSelf: "flex-start", fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>
                AI is thinking...
              </div>
            )}
            {sendMessage.isError && (
              <div style={{ alignSelf: "center", fontSize: 12, color: T.danger }}>
                Failed to send. Try again.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: 12,
              borderTop: `1px solid ${T.borderSubtle}`,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this notebook..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: T.radiusSm,
                background: T.bgActive,
                border: `1px solid ${T.borderSubtle}`,
                color: T.text,
                fontSize: 13,
                fontFamily: T.font,
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              style={{
                width: 34,
                height: 34,
                borderRadius: T.radiusSm,
                background: T.accent,
                border: "none",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: !input.trim() || sendMessage.isPending ? 0.5 : 1,
              }}
            >
              <SendIcon />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
