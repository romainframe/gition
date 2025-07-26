import { NextResponse } from "next/server";

import { getDocsFiles } from "@/lib/mdx";

export async function GET() {
  try {
    const docs = getDocsFiles();
    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching docs:", error);
    return NextResponse.json(
      { error: "Failed to fetch docs" },
      { status: 500 }
    );
  }
}
