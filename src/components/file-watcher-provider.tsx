"use client";

import { ReactNode } from "react";

import { useFileWatcher } from "@/hooks/useFileWatcher";

interface FileWatcherProviderProps {
  children: ReactNode;
}

export function FileWatcherProvider({ children }: FileWatcherProviderProps) {
  // Initialize file watcher
  useFileWatcher();

  return <>{children}</>;
}
