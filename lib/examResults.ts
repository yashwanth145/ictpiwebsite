import type { SupabaseClient } from "@supabase/supabase-js";
import type { CandidateProfile } from "@/lib/candidateExamSchedule";

export interface ResultsRow {
  id: number;
  email: string;
  status: string;
}

export type ExamStatusKind =
  | "completed"
  | "scheduled"
  | "pending"
  | "failed"
  | "not_started"
  | "in_progress";

export interface ExamStatusDisplay {
  text: string;
  color: string;
  glow: string;
  kind: ExamStatusKind;
}

const COMPLETED_STYLE: ExamStatusDisplay = {
  kind: "completed",
  text: "COMPLETED ✅",
  color: "bg-gradient-to-br from-emerald-500 to-teal-600",
  glow: "shadow-emerald-500/60",
};

const SCHEDULED_STYLE: ExamStatusDisplay = {
  kind: "scheduled",
  text: "SCHEDULED ⏰",
  color: "bg-gradient-to-br from-amber-500 to-orange-500",
  glow: "shadow-amber-500/60",
};

const PENDING_STYLE: ExamStatusDisplay = {
  kind: "pending",
  text: "PENDING ⚠️",
  color: "bg-gradient-to-br from-orange-500 to-red-500",
  glow: "shadow-orange-500/60",
};

const FAILED_STYLE: ExamStatusDisplay = {
  kind: "failed",
  text: "FAILED ⚠️",
  color: "bg-gradient-to-br from-red-500 to-red-900",
  glow: "shadow-red-500/60",
};

const NOT_STARTED_STYLE: ExamStatusDisplay = {
  kind: "not_started",
  text: "YET TO START 📚",
  color: "bg-gradient-to-br from-purple-600 to-indigo-600",
  glow: "shadow-purple-500/50",
};

const IN_PROGRESS_STYLE: ExamStatusDisplay = {
  kind: "in_progress",
  text: "IN PROGRESS ⏳",
  color: "bg-gradient-to-br from-blue-500 to-cyan-600",
  glow: "shadow-blue-500/60",
};

/** Allowed values when admin sets exam result fields. */
export const EXAM_RESULT_STATUS_OPTIONS = [
  "PENDING",
  "PASSED",
  "COMPLETED",
  "YET TO START",
] as const;

export type ExamResultStatus = (typeof EXAM_RESULT_STATUS_OPTIONS)[number];

export function normalizeExamResultStatus(
  value?: string | null
): ExamResultStatus | "" {
  if (!value?.trim()) return "";
  const v = value.trim().toUpperCase();
  if (v === "PENDING") return "PENDING";
  if (v === "COMPLETED" || v.includes("COMPLETED")) return "COMPLETED";
  if (v === "PASSED" || v.includes("PASSED")) return "PASSED";
  if (v === "YET TO START" || v === "NOT STARTED") return "YET TO START";
  return "";
}

export function isPracticeUrl(value?: string | null): boolean {
  if (!value?.trim()) return false;
  return /^https?:\/\//i.test(value.trim());
}

/** Map `candidate_exam_schedule` column values to a display status. */
export function classifyExamField(
  value?: string | null,
  options?: { isPractice?: boolean; isMock?: boolean }
): ExamStatusKind {
  if (!value?.trim()) return "not_started";

  const raw = value.trim();
  if (options?.isPractice && isPracticeUrl(raw)) {
    return "in_progress";
  }

  const v = raw.toUpperCase();

  if (v === "COMPLETED" || v === "PASSED" || v.includes("PASSED")) return "completed";
  if (v === "SCHEDULED") return "scheduled";
  if (v === "PENDING") return "pending";
  if (v === "FAILED") return "failed";
  if (v === "YET TO START" || v === "NOT STARTED") return "not_started";

  if (options?.isMock) {
    if (v.includes("PROGRESS")) return "in_progress";
    return "in_progress";
  }

  return "in_progress";
}

export function getExamStatusDisplay(
  value?: string | null,
  options?: { isPractice?: boolean; isMock?: boolean }
): ExamStatusDisplay {
  const kind = classifyExamField(value, options);
  const raw = value?.trim().toUpperCase() ?? "";

  if (raw === "PASSED") {
    return {
      kind: "completed",
      text: "PASSED ✅",
      color: COMPLETED_STYLE.color,
      glow: COMPLETED_STYLE.glow,
    };
  }

  switch (kind) {
    case "completed":
      return COMPLETED_STYLE;
    case "scheduled":
      return SCHEDULED_STYLE;
    case "pending":
      return {
        ...PENDING_STYLE,
        text: raw === "PENDING" ? "PENDING ⚠️" : PENDING_STYLE.text,
      };
    case "failed":
      return FAILED_STYLE;
    case "in_progress":
      if (options?.isMock) {
        return {
          ...IN_PROGRESS_STYLE,
          text: "MOCK EXAM IN PROGRESS ⏳",
        };
      }
      return IN_PROGRESS_STYLE;
    default:
      return NOT_STARTED_STYLE;
  }
}

export function isExamLevelCompleted(
  value?: string | null,
  options?: { isPractice?: boolean; isMock?: boolean }
): boolean {
  return classifyExamField(value, options) === "completed";
}

export function countCompletedExamLevels(candidate: CandidateProfile): number {
  return [
    isExamLevelCompleted(candidate.mepsc_assesment),
    isExamLevelCompleted(candidate.self_test_practice, { isPractice: true }),
    isExamLevelCompleted(candidate.mock_exam, { isMock: true }),
    isExamLevelCompleted(candidate.final_ctpr_exam),
  ].filter(Boolean).length;
}

export function shouldShowAttendExamLink(status?: string | null): boolean {
  return classifyExamField(status) !== "completed";
}

/** Load row from `public.results` by member email. */
export async function fetchResultsByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{ row: ResultsRow | null; error: string | null }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { row: null, error: "Missing email" };
  }

  const { data, error } = await supabase
    .from("results")
    .select("id, email, status")
    .ilike("email", trimmed)
    .limit(1);

  if (error) {
    return { row: null, error: error.message ?? "Failed to load results" };
  }

  const row = data?.[0] as ResultsRow | undefined;
  return { row: row ?? null, error: null };
}
