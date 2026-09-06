import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { preparationFromRow } from "@/utils/interviews/dashboard-data";
import { validatePreparation } from "@/utils/interviews/preparation-validation";
import { databaseError, InterviewError, interviewContext, interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new InterviewError("Sign in to save your interview plan.", 401);
    const { data, error } = await supabase.from("interview_preparation_profiles").select("experience,focus_themes,weekly_target,targets,updated_at").eq("user_id", user.id).maybeSingle();
    if (error) databaseError(error);
    return interviewJson({ profile: preparationFromRow(data) });
  } catch (error) { return interviewFailure(error); }
}

export async function PUT(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    let profile;
    try { profile = validatePreparation(body); }
    catch (error) { throw new InterviewError(error instanceof Error ? error.message : "Check your preparation details."); }
    const { data, error } = await admin.from("interview_preparation_profiles").upsert({
      user_id: user.id,
      experience: profile.experience,
      focus_themes: profile.focusThemes,
      weekly_target: profile.weeklyTarget,
      targets: profile.targets,
      updated_at: new Date().toISOString(),
    }).select("experience,focus_themes,weekly_target,targets,updated_at").single();
    if (error) databaseError(error);
    revalidatePath("/phloemai/interviews");
    revalidatePath("/phloemai/interviews/plan");
    revalidatePath("/phloemai/interviews/progress");
    revalidatePath("/phloemai/interviews/notifications");
    return interviewJson({ profile: preparationFromRow(data) });
  } catch (error) { return interviewFailure(error); }
}
