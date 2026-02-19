import { T } from "@/styles/tokens"
import type { Message } from "@/types/conversation"

type ChatMessageProps = {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "88%",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderRadius: T.radius,
          background: isUser ? T.accentSubtle : T.bgActive,
          border: isUser ? `1px solid ${T.accentBorder}` : `1px solid ${T.borderSubtle}`,
          fontSize: 13,
          lineHeight: 1.65,
          color: T.text,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
      <div
        style={{
          fontSize: 10,
          color: T.textMuted,
          marginTop: 4,
          textAlign: isUser ? "right" : "left",
        }}
      >
        {isUser ? "You" : "AI"}
      </div>
    </div>
  )
}
