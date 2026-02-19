import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useCallback } from "react"
import type { TiptapJSON } from "@/types/notebook"

type RichEditorProps = {
  initialContent: TiptapJSON | null
  onUpdate: (json: TiptapJSON) => void
  onSelectionChange?: (selectedText: string) => void
  placeholder?: string
  editable?: boolean
}

export function RichEditor({
  initialContent,
  onUpdate,
  onSelectionChange,
  placeholder = "Start writing...",
  editable = true,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent ?? undefined,
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as TiptapJSON
      onUpdate(json)
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange) {
        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to, " ")
        onSelectionChange(selectedText)
      }
    },
  })

  useEffect(() => {
    if (!editor) return
    if (initialContent && !editor.isFocused) {
      editor.commands.setContent(initialContent)
    }
  }, [initialContent?.type]) // Only react to content type changes (i.e., new notebook opened)

  const getSelectedText = useCallback(() => {
    if (!editor) return ""
    const { from, to } = editor.state.selection
    return editor.state.doc.textBetween(from, to, " ")
  }, [editor])

  useEffect(() => {
    // Expose getSelectedText on the window for EnhanceOverlay to access
    ;(window as any).__tiptap_getSelectedText = getSelectedText
    return () => {
      delete (window as any).__tiptap_getSelectedText
    }
  }, [getSelectedText])

  return <EditorContent editor={editor} />
}
