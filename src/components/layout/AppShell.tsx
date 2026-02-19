import { T } from "@/styles/tokens"
import { LeftSidebar } from "./LeftSidebar"
import { TopTabBar } from "./TopTabBar"
import { useUIStore } from "@/stores/uiStore"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { SparkCanvas } from "@/components/spark/SparkCanvas"
import { EnhanceOverlay } from "@/components/ai/EnhanceOverlay"
import { EnhanceDiff } from "@/components/ai/EnhanceDiff"
import { useEnhanceStore } from "@/stores/enhanceStore"
import { HomePage } from "@/pages/HomePage"
import { SparksPage } from "@/pages/SparksPage"
import { InboxPage } from "@/pages/InboxPage"
import { NotebooksPage } from "@/pages/NotebooksPage"
import { NotebookEditorPage } from "@/pages/NotebookEditorPage"
import { useCreateNotebook } from "@/hooks/useNotebooks"

export function AppShell() {
  useKeyboardShortcuts()

  const activePage = useUIStore((s) => s.activePage)
  const openTabs = useUIStore((s) => s.openTabs)
  const activeTabId = useUIStore((s) => s.activeTabId)
  const sparkCanvasVisible = useUIStore((s) => s.sparkCanvasVisible)

  const navigateTo = useUIStore((s) => s.navigateTo)
  const openNotebookTab = useUIStore((s) => s.openNotebookTab)
  const closeTab = useUIStore((s) => s.closeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const openSparkCanvas = useUIStore((s) => s.openSparkCanvas)
  const closeSparkCanvas = useUIStore((s) => s.closeSparkCanvas)

  const enhanceState = useEnhanceStore((s) => s.state)
  const closeOverlay = useEnhanceStore((s) => s.closeOverlay)
  const resetEnhance = useEnhanceStore((s) => s.reset)

  const createNotebook = useCreateNotebook()

  function handleNewNotebook() {
    const name = prompt("Notebook name:")
    if (!name?.trim()) return
    createNotebook.mutate(
      { name: name.trim() },
      {
        onSuccess: (notebook) => {
          openNotebookTab(notebook.id, notebook.name)
        },
      },
    )
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        background: T.bgSurface,
        color: T.text,
        fontFamily: T.font,
        overflow: "hidden",
      }}
    >
      <LeftSidebar
        activePage={activePage}
        onNavigate={navigateTo}
        onNewSpark={openSparkCanvas}
        onNewNotebook={handleNewNotebook}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {openTabs.length > 0 && (
          <TopTabBar
            tabs={openTabs}
            activeTabId={activeTabId}
            onTabClick={(id) => setActiveTab(id)}
            onTabClose={closeTab}
            onAddTab={() => navigateTo("notebooks")}
          />
        )}

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {activePage === "home" && <HomePage />}
          {activePage === "sparks" && <SparksPage />}
          {activePage === "inbox" && <InboxPage />}
          {activePage === "notebooks" && <NotebooksPage />}
          {activePage === "notebook" && activeTabId && (
            <NotebookEditorPage notebookId={activeTabId} />
          )}
        </div>
      </div>

      {sparkCanvasVisible && <SparkCanvas onClose={closeSparkCanvas} />}

      {enhanceState.status === "overlay_open" && (
        <EnhanceOverlay onClose={closeOverlay} />
      )}

      {enhanceState.status === "suggestion_ready" && (
        <EnhanceDiff onClose={resetEnhance} />
      )}
    </div>
  )
}
