"use client";

import { useCallback, useEffect, useRef } from "react";

import { useDocsStore } from "@/store/useDocsStore";
import { useStructureStore } from "@/store/useStructureStore";
import { useTaskStore } from "@/store/useTaskStore";

export interface FileChangeEvent {
  type: "file-change" | "file-add" | "file-remove" | "connected" | "heartbeat";
  path?: string;
  timestamp: number;
}

export function useFileWatcher() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { debouncedRefresh } = useTaskStore();
  const { refreshDocs } = useDocsStore();
  const { refreshStructure } = useStructureStore();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    try {
      eventSourceRef.current = new EventSource("/api/files/watch");

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data: FileChangeEvent = JSON.parse(event.data);

          console.log("📡 File watcher event:", data);

          switch (data.type) {
            case "connected":
              console.log("🔗 File watcher connected");
              reconnectAttempts.current = 0;
              break;

            case "file-change":
            case "file-add":
            case "file-remove":
              console.log(`📁 ${data.type}:`, data.path);

              // Check if it's a markdown file we care about
              if (
                data.path &&
                (data.path.endsWith(".md") || data.path.endsWith(".mdx"))
              ) {
                console.log("🔄 Triggering refresh due to file change");

                // Always refresh structure for file add/remove operations
                if (data.type === "file-add" || data.type === "file-remove") {
                  console.log("📁 Refreshing sidebar structure");
                  refreshStructure();
                }

                // Determine if it's a docs file or tasks file
                if (data.path.includes("/docs/")) {
                  console.log("📚 Refreshing docs store");

                  // Call global scroll preservation function if available
                  const windowWithPreserve = window as Window & {
                    __preserveScrollPosition?: () => void;
                  };
                  if (
                    typeof window !== "undefined" &&
                    windowWithPreserve.__preserveScrollPosition
                  ) {
                    console.log("🎯 Calling global scroll preservation");
                    windowWithPreserve.__preserveScrollPosition();
                  }

                  refreshDocs();
                }

                if (data.path.includes("/tasks/")) {
                  console.log("📋 Refreshing tasks store");
                  debouncedRefresh();
                }

                // If neither docs nor tasks, refresh both to be safe
                if (
                  !data.path.includes("/docs/") &&
                  !data.path.includes("/tasks/")
                ) {
                  console.log("📚📋 Refreshing both stores");
                  refreshDocs();
                  debouncedRefresh();
                }
              }
              break;

            case "heartbeat":
              // Connection is alive
              break;
          }
        } catch (error) {
          console.error("Error parsing file watcher message:", error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error("File watcher error:", error);

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          console.log(
            `🔄 Attempting to reconnect file watcher in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.warn("📵 Max reconnection attempts reached for file watcher");
        }
      };

      eventSourceRef.current.onopen = () => {
        console.log("🌐 File watcher connection opened");
      };
    } catch (error) {
      console.error("Failed to establish file watcher connection:", error);
    }
  }, [debouncedRefresh, refreshDocs, refreshStructure]);

  useEffect(() => {
    // Only connect in development mode and on client side
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected:
      typeof window !== "undefined" &&
      eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnect: connect,
  };
}
