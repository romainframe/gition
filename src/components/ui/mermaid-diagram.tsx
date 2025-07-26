"use client";

import { useEffect, useState } from "react";

import mermaid from "mermaid";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

let mermaidInitialized = false;

const initializeMermaid = () => {
  if (!mermaidInitialized) {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "loose",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        fontSize: 14,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        sequence: {
          useMaxWidth: true,
        },
        themeVariables: {
          primaryColor: "#f3f4f6",
          primaryTextColor: "#1f2937",
          primaryBorderColor: "#d1d5db",
          lineColor: "#6b7280",
          secondaryColor: "#f9fafb",
          tertiaryColor: "#ffffff",
          background: "#ffffff",
          mainBkg: "#f9fafb",
          secondBkg: "#f3f4f6",
          tertiaryBkg: "#ffffff",
        },
      });

      mermaidInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Mermaid:", error);
    }
  }
};

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart.trim()) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Initialize mermaid if not already done
        initializeMermaid();

        // Wait a bit for mermaid to be fully ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Try to parse first (newer mermaid versions)
        try {
          await mermaid.parse(chart);
        } catch (parseError) {
          // Continue with render even if parse fails
          console.error("Failed to parse mermaid diagram:", parseError);
        }

        // Render the diagram
        const result = await mermaid.render(id, chart);

        if (result && result.svg && result.svg.length > 0) {
          // Clean up the SVG to ensure it works in React
          let cleanSvg = result.svg;

          // Ensure proper SVG structure
          if (!cleanSvg.includes("viewBox")) {
            // Add a viewBox if it's missing
            cleanSvg = cleanSvg.replace("<svg", '<svg viewBox="0 0 100 100"');
          }

          setSvg(cleanSvg);
          setError("");
        } else {
          throw new Error("No valid SVG returned from mermaid.render");
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to render diagram"
        );
        setSvg("");
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure component is mounted
    const timeoutId = setTimeout(renderDiagram, 50);
    return () => clearTimeout(timeoutId);
  }, [chart]);

  if (isLoading) {
    return (
      <div className={cn("my-4", className)}>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Mermaid Diagram
          </span>
          <Badge variant="outline" className="text-xs">
            mermaid
          </Badge>
        </div>
        <div className="flex items-center justify-center py-6 bg-muted/20 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">
            Rendering diagram...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("my-4", className)}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-destructive">
              Mermaid Diagram Error
            </span>
            <Badge variant="destructive" className="text-xs">
              error
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSource(!showSource)}
            className="text-xs h-6"
          >
            {showSource ? "Hide" : "Show"} Source
          </Button>
        </div>
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="text-sm text-destructive mb-2">{error}</div>
          {showSource && (
            <pre className="text-xs bg-destructive/5 p-2 rounded font-mono overflow-auto">
              {chart}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("my-4", className)}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Mermaid Diagram
          </span>
          <Badge variant="outline" className="text-xs">
            mermaid
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSource(!showSource)}
          className="text-xs h-6"
        >
          {showSource ? "Hide" : "Show"} Source
        </Button>
      </div>
      <div>
        {svg && (
          <div
            className="mermaid-container flex justify-center items-center p-3 bg-muted/20 rounded-lg overflow-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
        {showSource && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              View Source
            </summary>
            <pre className="mt-1 text-xs bg-muted/50 p-2 rounded font-mono overflow-auto">
              {chart}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
