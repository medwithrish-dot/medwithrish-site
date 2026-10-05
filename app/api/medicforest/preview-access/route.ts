// Retired: access keys no longer grant platform access.
export function POST() {
  return Response.json({ error: "Preview access keys are no longer used. Explore MedicForest and sign up when you start practising." }, { status: 410 });
}
