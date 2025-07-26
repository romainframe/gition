import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface MarkdownFile {
  slug: string;
  filename: string;
  filepath: string;
  content: string;
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
    date?: string;
    author?: string;
    status?: "draft" | "published" | "archived";
    [key: string]: unknown;
  };
  excerpt?: string;
}

interface DocsStore {
  // State
  docs: MarkdownFile[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;

  // Actions
  setDocs: (docs: MarkdownFile[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Data fetching
  fetchDocs: () => Promise<void>;
  refreshDocs: () => void;

  // Utilities
  getDocBySlug: (slug: string) => MarkdownFile | undefined;
}

// Debounce timeout for file changes
let docsRefreshTimeout: NodeJS.Timeout | null = null;

export const useDocsStore = create<DocsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      docs: [],
      isLoading: false,
      error: null,
      lastUpdated: 0,

      // Basic setters
      setDocs: (docs) => set({ docs, lastUpdated: Date.now() }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Data fetching
      fetchDocs: async () => {
        console.log("📚 fetchDocs called");
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/docs");
          if (!response.ok) {
            throw new Error("Failed to fetch docs");
          }

          const docs = await response.json();
          console.log("📚 New docs data:", docs.length, "documents");
          set({ docs, isLoading: false, lastUpdated: Date.now() });
          console.log("✅ Docs store updated");
        } catch (error) {
          console.error("❌ Error fetching docs:", error);
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      // Debounced refresh for file changes
      refreshDocs: () => {
        if (docsRefreshTimeout) {
          clearTimeout(docsRefreshTimeout);
        }

        docsRefreshTimeout = setTimeout(() => {
          console.log("🔄 Debounced docs refresh triggered");
          get().fetchDocs();
          docsRefreshTimeout = null;
        }, 500); // 500ms debounce for docs (faster than tasks)
      },

      // Utilities
      getDocBySlug: (slug: string) => {
        return get().docs.find((doc) => doc.slug === slug);
      },
    }),
    {
      name: "docs-store",
    }
  )
);
