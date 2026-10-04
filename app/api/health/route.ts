// Liveness only. Account/database/AI readiness needs a signed-in smoke test.
export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
