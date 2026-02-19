import { useEffect } from "react"
import { useUIStore } from "@/stores/uiStore"
import { useEnhanceStore } from "@/stores/enhanceStore"

export function useKeyboardShortcuts() {
  const openSparkCanvas = useUIStore((s) => s.openSparkCanvas)
  const openOverlay = useEnhanceStore((s) => s.openOverlay)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC")
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (!modifier) return

      // Cmd/Ctrl + S → open spark canvas (unless in an input/textarea)
      if (e.key === "s" || e.key === "S") {
        const activeElement = document.activeElement
        const isEditableContext =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement

        // Only intercept in non-editable contexts
        if (!isEditableContext) {
          e.preventDefault()
          openSparkCanvas()
        }
      }

      // Cmd/Ctrl + L → open enhance overlay
      if (e.key === "l" || e.key === "L") {
        e.preventDefault()
        const selection = window.getSelection()
        const selectedText = selection?.toString().trim() || undefined
        openOverlay(selectedText)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [openSparkCanvas, openOverlay])
}
