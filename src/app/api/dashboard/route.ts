import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const IS_VERCEL = !!process.env.VERCEL;
const SNAPSHOT_PATH = path.join(process.cwd(), "public", "data-snapshot.json");

export async function GET() {
  try {
    if (IS_VERCEL) {
      // On Vercel: serve from pre-built snapshot
      if (fs.existsSync(SNAPSHOT_PATH)) {
        const raw = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
        const data = JSON.parse(raw);
        return NextResponse.json(data, {
          headers: {
            "X-Data-Source": "snapshot",
            "X-Snapshot-At": data._snapshot?.generatedAt || "unknown",
          },
        });
      }
      return NextResponse.json(
        { error: "No data snapshot available. Run `npm run snapshot` before deploying." },
        { status: 503 }
      );
    }

    // Local: serve live data from filesystem
    const { getDashboardData } = await import("@/lib/data");
    const data = getDashboardData();
    return NextResponse.json(data, {
      headers: { "X-Data-Source": "live" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load dashboard data", details: String(error) },
      { status: 500 }
    );
  }
}
