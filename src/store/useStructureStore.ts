import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { DirectoryStructure } from "@/models";

interface StructureStore {
  // State
  structure: DirectoryStructure | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;

  // Actions
  setStructure: (structure: DirectoryStructure) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Data fetching
  fetchStructure: () => Promise<void>;
  refreshStructure: () => void;
}

// Debounce timeout for structure changes
let structureRefreshTimeout: NodeJS.Timeout | null = null;

export const useStructureStore = create<StructureStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      structure: null,
      isLoading: false,
      error: null,
      lastUpdated: 0,

      // Basic setters
      setStructure: (structure) => set({ structure, lastUpdated: Date.now() }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Data fetching
      fetchStructure: async () => {
        console.log("📁 fetchStructure called");
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/structure");
          if (!response.ok) {
            throw new Error("Failed to fetch directory structure");
          }

          const structure = await response.json();
          console.log("📁 New structure data loaded");
          set({ structure, isLoading: false, lastUpdated: Date.now() });
          console.log("✅ Structure store updated");
        } catch (error) {
          console.error("❌ Error fetching structure:", error);
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      // Debounced refresh for file changes
      refreshStructure: () => {
        if (structureRefreshTimeout) {
          clearTimeout(structureRefreshTimeout);
        }

        structureRefreshTimeout = setTimeout(() => {
          console.log("🔄 Debounced structure refresh triggered");
          get().fetchStructure();
          structureRefreshTimeout = null;
        }, 800); // 800ms debounce for structure (slower since it's less critical)
      },
    }),
    {
      name: "structure-store",
    }
  )
);
