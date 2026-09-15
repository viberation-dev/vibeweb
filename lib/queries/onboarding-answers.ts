import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables, TablesUpdate } from "@/types/supabase";

export type OnboardingAnswers = Tables<"onboarding_answers">;
export type OnboardingAnswersPatch = Omit<
  TablesUpdate<"onboarding_answers">,
  "user_id" | "updated_at"
>;

type Client = SupabaseClient<Database>;

/** The signed-in user's answers, or null before they have given any. */
export async function getOnboardingAnswers(
  client: Client,
  userId: string,
): Promise<OnboardingAnswers | null> {
  const { data, error } = await client
    .from("onboarding_answers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`getOnboardingAnswers(${userId}): ${error.message}`);
  }
  return data;
}

/**
 * Saves one step's answer. An upsert, because each step writes as it goes and
 * the first one to arrive creates the row. RLS scopes it to the caller.
 */
export async function saveOnboardingAnswers(
  client: Client,
  userId: string,
  patch: OnboardingAnswersPatch,
): Promise<void> {
  const { error } = await client
    .from("onboarding_answers")
    .upsert({ ...patch, user_id: userId, updated_at: new Date().toISOString() });

  if (error) {
    throw new Error(`saveOnboardingAnswers(${userId}): ${error.message}`);
  }
}
