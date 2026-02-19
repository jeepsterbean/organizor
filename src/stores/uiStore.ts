import { create } from "zustand"
import type { NotebookId } from "@/types/notebook"
import type { SparkRootId } from "@/types/spark"

export type ActivePage = "home" | "sparks" | "inbox" | "notebooks" | "notebook"

export type OpenTab = {
  id: NotebookId
  label: string
}

type UIState = {
  activePage: ActivePage
  openTabs: OpenTab[]
  activeTabId: NotebookId | null
  sparkCanvasVisible: boolean
  selectedSparkRootId: SparkRootId | null

  navigateTo: (page: ActivePage) => void
  openNotebookTab: (id: NotebookId, name: string) => void
  closeTab: (id: NotebookId) => void
  setActiveTab: (id: NotebookId) => void
  openSparkCanvas: () => void
  closeSparkCanvas: () => void
  selectSpark: (rootId: SparkRootId | null) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  activePage: "home",
  openTabs: [],
  activeTabId: null,
  sparkCanvasVisible: false,
  selectedSparkRootId: null,

  navigateTo: (page) => {
    set({ activePage: page })
    if (page !== "notebook") {
      set({ activeTabId: null })
    }
  },

  openNotebookTab: (id, name) => {
    const { openTabs } = get()
    const alreadyOpen = openTabs.some((t) => t.id === id)
    if (!alreadyOpen) {
      set({ openTabs: [...openTabs, { id, label: name }] })
    }
    set({ activeTabId: id, activePage: "notebook" })
  },

  closeTab: (id) => {
    const { openTabs, activeTabId } = get()
    const nextTabs = openTabs.filter((t) => t.id !== id)

    if (activeTabId === id) {
      const lastTab = nextTabs[nextTabs.length - 1]
      if (lastTab) {
        set({ openTabs: nextTabs, activeTabId: lastTab.id, activePage: "notebook" })
      } else {
        set({ openTabs: nextTabs, activeTabId: null, activePage: "home" })
      }
    } else {
      set({ openTabs: nextTabs })
    }
  },

  setActiveTab: (id) => {
    set({ activeTabId: id, activePage: "notebook" })
  },

  openSparkCanvas: () => set({ sparkCanvasVisible: true }),
  closeSparkCanvas: () => set({ sparkCanvasVisible: false }),

  selectSpark: (rootId) => set({ selectedSparkRootId: rootId }),
}))
