import { NextResponse } from "next/server";

import { getDocsFromManifest } from "@/lib/manifest";
import { getDocsFiles } from "@/lib/mdx";

export async function GET() {
  try {
    // Try to get docs from manifest first (production)
    const manifestDocs = await getDocsFromManifest();
    const docs = manifestDocs || getDocsFiles();

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching docs:", error);
    return NextResponse.json(
      { error: "Failed to fetch docs" },
      { status: 500 }
    );
  }
}
