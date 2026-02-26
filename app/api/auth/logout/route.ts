import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/app/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = process.env.VERCEL ? "https" : "http";
  return NextResponse.redirect(`${proto}://${host}/`, { status: 303 });
}
