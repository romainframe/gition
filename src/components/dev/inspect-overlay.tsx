"use client";

import { Info } from "lucide-react";

import { useInspect } from "@/contexts/inspect-context";
import { cn } from "@/lib/utils";

interface InspectOverlayProps {
  componentId: string;
  children: React.ReactNode;
  className?: string;
}

export function InspectOverlay({
  componentId,
  children,
  className,
}: InspectOverlayProps) {
  const { isInspectMode, isAvailable, setHoveredComponent } = useInspect();

  // Don't render anything if inspect mode is not available or not active
  if (!isAvailable || !isInspectMode) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative group", className)}>
      {children}

      {/* Inspect Icon - appears on component hover, triggers tooltip on icon hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
        <div
          className="bg-blue-500 text-white rounded-full p-1 shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
          onMouseEnter={() => setHoveredComponent(componentId)}
          onMouseLeave={() => setHoveredComponent(null)}
        >
          <Info className="h-4 w-4" />
        </div>
      </div>

      {/* Hover overlay border - shown on component hover */}
      <div className="absolute inset-0 border-2 border-blue-500 rounded opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
}
