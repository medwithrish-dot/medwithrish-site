import { requestInterviewPlatform, preparationTable, interviewBase } from "@/utils/interviews/platform";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { preparationFromRow } from "@/utils/interviews/dashboard-data";
import { validatePreparation } from "@/utils/interviews/preparation-validation";
import { databaseError, InterviewError, interviewContext, interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";

export async function GET(request: Request) {
  try {
    const platform = requestInterviewPlatform(request);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new InterviewError("Sign in to save your Med interview plan.", 401);
    const { data, error } = await supabase.from(preparationTable(platform)).select("*").eq("user_id", user.id).maybeSingle();
    if (error) databaseError(error);
    return interviewJson({ profile: preparationFromRow(data) });
  } catch (error) { return interviewFailure(error); }
}

export async function PUT(request: Request) {
  try {
    const platform = requestInterviewPlatform(request);
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    let profile;
    try { profile = validatePreparation(body, platform); }
    catch (error) { throw new InterviewError(error instanceof Error ? error.message : "Check your preparation details."); }
    const { data, error } = await admin.from(preparationTable(platform)).upsert({
      user_id: user.id,
      experience: profile.experience,
      focus_themes: profile.focusThemes,
      weekly_target: profile.weeklyTarget,
      targets: profile.targets,
      ...(body.applicant !== undefined ? { applicant: profile.applicant } : {}),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" }).select("*").single();
    if (error) databaseError(error);
    revalidatePath(`${interviewBase(platform)}/dashboard`);
    revalidatePath(`${interviewBase(platform)}/plan`);
    revalidatePath(`${interviewBase(platform)}/progress`);
    revalidatePath(`${interviewBase(platform)}/notifications`);
    return interviewJson({ profile: preparationFromRow(data) });
  } catch (error) { return interviewFailure(error); }
}
