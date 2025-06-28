import { NextResponse } from "next/server";
import { fetchScenarioById } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop(); // ← `/api/scenarios/123` → "123" に分解！

  if (!id) {
    return new NextResponse("IDが指定されていません…", { status: 400 });
  }

  const scenario = await fetchScenarioById(id);

  if (!scenario) {
    return new NextResponse("シナリオが見つかりません…", { status: 404 });
  }

  return NextResponse.json(scenario);
}