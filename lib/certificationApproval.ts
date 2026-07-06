/** Shared `certification_approval` row shape and admin toggle columns. */

export interface CertificationApprovalRow {
  membership_id: string | null;
  skill_india: string | null;
  ncvet: string | null;
  ctpr_membership: string | null;
  practicing: string | null;
  skill_india_generated: string | null;
  ncvet_generated: string | null;
  membership_cert_generated: string | null;
  practicing_generated: string | null;
  icpa_skillindia: string | null;
  icpa_marksheet: string | null;
  icpa_generated: string | null;
}

export const STANDARD_APPROVAL_COLS = [
  { key: "skill_india", label: "Skill India" },
  { key: "ncvet", label: "NCVET" },
  { key: "ctpr_membership", label: "CTPr Membership" },
  { key: "practicing", label: "Practicing" },
] as const;

export const ICPA_APPROVAL_COLS = [
  { key: "icpa_skillindia", label: "ICPA Skill India" },
  { key: "icpa_marksheet", label: "ICPA Marksheet" },
  { key: "icpa_generated", label: "ICPA Certificate" },
] as const;

export const ALL_APPROVAL_COLS = [
  ...STANDARD_APPROVAL_COLS,
  ...ICPA_APPROVAL_COLS,
] as const;

export type ApprovalColumnKey = (typeof ALL_APPROVAL_COLS)[number]["key"];

export const GENERATED_FLAG_COLS = [
  { key: "skill_india_generated", label: "Skill India" },
  { key: "ncvet_generated", label: "NCVET" },
  { key: "membership_cert_generated", label: "CTPr Membership" },
  { key: "practicing_generated", label: "Practicing" },
] as const;

export const DEFAULT_CERTIFICATION_APPROVAL: Omit<
  CertificationApprovalRow,
  "membership_id"
> = {
  skill_india: "0",
  ncvet: "0",
  ctpr_membership: "0",
  practicing: "0",
  skill_india_generated: "0",
  ncvet_generated: "0",
  membership_cert_generated: "0",
  practicing_generated: "0",
  icpa_skillindia: "0",
  icpa_marksheet: "0",
  icpa_generated: "0",
};

export const CERTIFICATION_APPROVAL_SELECT =
  "membership_id, skill_india, ncvet, ctpr_membership, practicing, skill_india_generated, ncvet_generated, membership_cert_generated, practicing_generated, icpa_skillindia, icpa_marksheet, icpa_generated";

export function isCertificationApproved(
  value: string | null | undefined
): boolean {
  return String(value ?? "").trim() === "1";
}
