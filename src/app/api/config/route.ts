import { NextRequest, NextResponse } from "next/server";

import { initializeConfig } from "@/lib/config";
import type { ConfigManager } from "@/lib/config";
import { getTargetDirectory } from "@/lib/mdx";

// Initialize config manager
let configManager: ConfigManager | null = null;

function getConfig() {
  if (!configManager) {
    const targetDir = getTargetDirectory();
    configManager = initializeConfig(targetDir);
  }
  return configManager;
}

export async function GET() {
  try {
    const manager = getConfig();
    const config = manager.getConfig();

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error getting config:", error);
    return NextResponse.json(
      { error: "Failed to load configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const manager = getConfig();

    // Update configuration
    manager.saveConfig(body);

    // Return updated config
    const updatedConfig = manager.getConfig();
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const manager = getConfig();

    // Replace entire configuration
    manager.initializeConfig(body);

    // Return new config
    const newConfig = manager.getConfig();
    return NextResponse.json(newConfig);
  } catch (error) {
    console.error("Error replacing config:", error);
    return NextResponse.json(
      { error: "Failed to replace configuration" },
      { status: 500 }
    );
  }
}
