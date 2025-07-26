"use client";

import { useEffect, useState } from "react";

import { Copy, ExternalLink, File, Package, Server, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type ComponentMetadata, useInspect } from "@/contexts/inspect-context";

export function InspectTooltip() {
  const { hoveredComponent, getComponentMetadata, isInspectMode } =
    useInspect();
  const [metadata, setMetadata] = useState<ComponentMetadata | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (hoveredComponent) {
      const componentMetadata = getComponentMetadata(hoveredComponent);
      setMetadata(componentMetadata || null);
    } else {
      setMetadata(null);
    }
  }, [hoveredComponent, getComponentMetadata]);

  useEffect(() => {
    if (!hoveredComponent) return;

    const handleMouseMove = (e: MouseEvent) => {
      const tooltipWidth = 320; // Approximate width of tooltip
      const tooltipHeight = 400; // Approximate height of tooltip
      const margin = 20; // Margin from screen edges

      let x = e.clientX + 10;
      let y = e.clientY + 10;

      // Adjust X position if tooltip would go off right edge
      if (x + tooltipWidth > window.innerWidth - margin) {
        x = e.clientX - tooltipWidth - 10;
      }

      // Adjust Y position if tooltip would go off bottom edge
      if (y + tooltipHeight > window.innerHeight - margin) {
        y = e.clientY - tooltipHeight - 10;
      }

      // Ensure tooltip doesn't go off left edge
      if (x < margin) {
        x = margin;
      }

      // Ensure tooltip doesn't go off top edge
      if (y < margin) {
        y = margin;
      }

      setPosition({ x, y });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [hoveredComponent]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isInspectMode || !hoveredComponent || !metadata) {
    return null;
  }

  return (
    <div
      className="fixed z-[100] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <Card className="w-80 pointer-events-auto shadow-xl border-2 border-blue-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{metadata.name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              Component
            </Badge>
          </div>
          {metadata.description && (
            <CardDescription>{metadata.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* File Path */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <File className="h-4 w-4" />
              File Path
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono">
                {metadata.filePath}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(metadata.filePath)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Interfaces */}
          {metadata.interfaces && metadata.interfaces.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Interfaces/Types
                </div>
                <div className="flex flex-wrap gap-1">
                  {metadata.interfaces.map((interface_) => (
                    <Badge
                      key={interface_}
                      variant="secondary"
                      className="text-xs"
                    >
                      {interface_}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* API Dependencies */}
          {metadata.apiDependencies && metadata.apiDependencies.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Server className="h-4 w-4" />
                  API Dependencies
                </div>
                <div className="space-y-1">
                  {metadata.apiDependencies.map((api) => (
                    <div
                      key={api}
                      className="text-xs bg-muted px-2 py-1 rounded flex items-center justify-between"
                    >
                      <code className="font-mono">{api}</code>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Store Dependencies */}
          {metadata.storeDependencies &&
            metadata.storeDependencies.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    Store Dependencies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {metadata.storeDependencies.map((store) => (
                      <Badge key={store} variant="outline" className="text-xs">
                        {store}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

          {/* Props */}
          {metadata.props && Object.keys(metadata.props).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ExternalLink className="h-4 w-4" />
                  Current Props
                </div>
                <div className="text-xs bg-muted px-2 py-1 rounded">
                  <pre className="whitespace-pre-wrap font-mono">
                    {JSON.stringify(metadata.props, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
