"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { isVibeInspectAvailable } from "@/utils/dev-mode";

interface ComponentMetadata {
  name: string;
  filePath: string;
  props?: Record<string, unknown>;
  interfaces?: string[];
  apiDependencies?: string[];
  storeDependencies?: string[];
  description?: string;
}

interface InspectContextType {
  isInspectMode: boolean;
  toggleInspectMode: () => void;
  isAvailable: boolean;
  registerComponent: (id: string, metadata: ComponentMetadata) => void;
  getComponentMetadata: (id: string) => ComponentMetadata | undefined;
  hoveredComponent: string | null;
  setHoveredComponent: (id: string | null) => void;
}

const InspectContext = createContext<InspectContextType | undefined>(undefined);

const INSPECT_MODE_KEY = "gition-vibe-inspect-mode";

export function InspectProvider({ children }: { children: React.ReactNode }) {
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [componentRegistry, setComponentRegistry] = useState<
    Map<string, ComponentMetadata>
  >(new Map());
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const isAvailable = isVibeInspectAvailable();

  // Load saved state from localStorage
  useEffect(() => {
    if (!isAvailable) return;

    const saved = localStorage.getItem(INSPECT_MODE_KEY);
    if (saved === "true") {
      setIsInspectMode(true);
    }
  }, [isAvailable]);

  const toggleInspectMode = useCallback(() => {
    if (!isAvailable) return;

    setIsInspectMode((prev) => {
      const newState = !prev;
      localStorage.setItem(INSPECT_MODE_KEY, newState.toString());
      return newState;
    });
  }, [isAvailable]);

  const registerComponent = useCallback(
    (id: string, metadata: ComponentMetadata) => {
      if (!isAvailable) return;

      setComponentRegistry((prev) => {
        // Only update if the metadata actually changed
        const existing = prev.get(id);
        if (existing && JSON.stringify(existing) === JSON.stringify(metadata)) {
          return prev;
        }
        return new Map(prev.set(id, metadata));
      });
    },
    [isAvailable]
  );

  const getComponentMetadata = useCallback(
    (id: string) => {
      return componentRegistry.get(id);
    },
    [componentRegistry]
  );

  const contextValue = useMemo(
    () => ({
      isInspectMode,
      toggleInspectMode,
      isAvailable,
      registerComponent,
      getComponentMetadata,
      hoveredComponent,
      setHoveredComponent,
    }),
    [
      isInspectMode,
      toggleInspectMode,
      isAvailable,
      registerComponent,
      getComponentMetadata,
      hoveredComponent,
    ]
  );

  return (
    <InspectContext.Provider value={contextValue}>
      {children}
    </InspectContext.Provider>
  );
}

export function useInspect() {
  const context = useContext(InspectContext);
  if (context === undefined) {
    throw new Error("useInspect must be used within an InspectProvider");
  }
  return context;
}

export type { ComponentMetadata };
