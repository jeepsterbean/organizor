import { T } from "@/styles/tokens"
import { NotebookEditor } from "@/components/notebook/NotebookEditor"
import { useNotebook } from "@/hooks/useNotebooks"
import type { NotebookId } from "@/types/notebook"

type NotebookEditorPageProps = {
  notebookId: NotebookId
}

export function NotebookEditorPage({ notebookId }: NotebookEditorPageProps) {
  const { data: notebook, isLoading, isError } = useNotebook(notebookId)

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.textMuted,
          fontFamily: T.font,
          fontSize: 14,
        }}
      >
        Loading notebook…
      </div>
    )
  }

  if (isError || !notebook) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.danger,
          fontFamily: T.font,
          fontSize: 14,
        }}
      >
        Failed to load notebook.
      </div>
    )
  }

  return <NotebookEditor notebook={notebook} />
}
