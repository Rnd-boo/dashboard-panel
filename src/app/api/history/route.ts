import { historyRecords } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : null;

  if (limit && limit > 0) {
    return Response.json(historyRecords.slice(-limit));
  }

  return Response.json(historyRecords);
}
