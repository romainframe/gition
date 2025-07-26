"use client";

import { useEffect } from "react";

import {
  type ComponentMetadata,
  useInspect as useInspectContext,
} from "@/contexts/inspect-context";

interface UseInspectOptions {
  componentId: string;
  name: string;
  filePath: string;
  description?: string;
  interfaces?: string[];
  apiDependencies?: string[];
  storeDependencies?: string[];
  props?: Record<string, unknown>;
}

/**
 * Hook to register a component for inspection and get inspect utilities
 */
export function useComponentInspect({
  componentId,
  name,
  filePath,
  description,
  interfaces,
  apiDependencies,
  storeDependencies,
  props,
}: UseInspectOptions) {
  const { isAvailable, registerComponent, isInspectMode } = useInspectContext();

  // Register component metadata only once when the component mounts
  useEffect(() => {
    if (!isAvailable) return;

    const metadata: ComponentMetadata = {
      name,
      filePath,
      description,
      interfaces,
      apiDependencies,
      storeDependencies,
      props,
    };

    registerComponent(componentId, metadata);

    // No cleanup needed as components should persist in registry
  }, [
    componentId,
    name,
    filePath,
    description,
    isAvailable,
    registerComponent,
    interfaces,
    apiDependencies,
    storeDependencies,
    props,
  ]);
  // Intentionally excluding arrays and props to prevent re-registrations

  return {
    isInspectMode,
    isAvailable,
  };
}

export { useInspect } from "@/contexts/inspect-context";
