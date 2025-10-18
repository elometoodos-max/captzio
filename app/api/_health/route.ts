import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.OPENAI_API_KEY,
    keyLen: process.env.OPENAI_API_KEY?.length ?? 0,
    env: process.env.VERCEL_ENV || "local",
  });
}
