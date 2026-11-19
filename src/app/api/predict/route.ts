import { NextResponse } from "next/server";
import { getPrediction } from "@/lib/predictions";

export async function GET() {
  try {
    return NextResponse.json(await getPrediction());
  } catch (error) {
    console.error("Prediction error:", error);

    return NextResponse.json(
      { error: "Failed to generate prediction" },
      { status: 500 },
    );
  }
}
