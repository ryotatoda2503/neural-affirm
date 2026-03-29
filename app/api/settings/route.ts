import { NextResponse } from "next/server";
import {
  getAllSettings,
  setSetting,
  getPageSeo,
  setPageSeo,
} from "../../../lib/settings-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (path) {
    const seo = getPageSeo(path);
    return NextResponse.json(seo || {});
  }

  const settings = getAllSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const data = await request.json();

  // Handle page SEO update
  if (data.pageSeo && data.path) {
    setPageSeo(data.path, data.pageSeo);
    return NextResponse.json({ ok: true });
  }

  // Handle site settings update
  for (const [key, value] of Object.entries(data)) {
    if (key !== "pageSeo" && key !== "path") {
      setSetting(key, value as string);
    }
  }

  return NextResponse.json({ ok: true });
}
