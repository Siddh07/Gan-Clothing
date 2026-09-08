import { NextRequest, NextResponse } from "next/server";
import { submitInquiry } from "@/actions/inquiry";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await submitInquiry(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
