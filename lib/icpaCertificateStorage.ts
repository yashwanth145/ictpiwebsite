import type { SupabaseClient } from "@supabase/supabase-js";
import {
  certificateFileNameToTitle,
  getCertificatePublicUrl,
  membershipIdVariantsForCerts,
} from "@/lib/certificateStorageShared";

export const ICPA_CERTIFICATES_BUCKET = "icpa_certificates";

/** Top-level folders inside `icpa_certificates` — one subfolder per membership_id. */
export const ICPA_CERTIFICATE_TYPES = [
  {
    key: "skill_india",
    label: "Skill India",
    folder: "skill_india",
    approvalCol: "icpa_skillindia",
  },
  {
    key: "marksheet",
    label: "Marksheet",
    folder: "marksheet",
    approvalCol: "icpa_marksheet",
  },
  {
    key: "icpa_cert",
    label: "ICPA Certificate",
    folder: "icpa_cert",
    approvalCol: "icpa_generated",
  },
] as const;

export type IcpaCertificateKey = (typeof ICPA_CERTIFICATE_TYPES)[number]["key"];
export type IcpaApprovalColumn =
  (typeof ICPA_CERTIFICATE_TYPES)[number]["approvalCol"];

export function icpaApprovalColumnForKey(
  key: IcpaCertificateKey
): IcpaApprovalColumn {
  const match = ICPA_CERTIFICATE_TYPES.find((t) => t.key === key);
  return match?.approvalCol ?? "icpa_generated";
}

export interface IcpaCertificateFile {
  title: string;
  storagePath: string;
  download: string;
  url: string;
  folder: string;
}

export interface IcpaCertificateSlot {
  key: IcpaCertificateKey;
  label: string;
  folder: string;
  file: IcpaCertificateFile | null;
}

export function getIcpaCertificatePublicUrl(storagePath: string): string {
  return getCertificatePublicUrl(ICPA_CERTIFICATES_BUCKET, storagePath);
}

function toIcpaFile(
  storagePath: string,
  folder: string
): IcpaCertificateFile {
  const name = storagePath.split("/").pop() ?? storagePath;
  return {
    title: certificateFileNameToTitle(name),
    storagePath,
    download: name,
    url: getIcpaCertificatePublicUrl(storagePath),
    folder,
  };
}

/** List PDF files under `{folder}/{membershipId}/` for each ID variant. */
async function listPdfsInMemberFolder(
  supabase: SupabaseClient,
  folder: string,
  variants: string[]
): Promise<IcpaCertificateFile[]> {
  const found = new Map<string, IcpaCertificateFile>();

  for (const variant of variants) {
    const prefix = `${folder}/${variant}`;
    const queue = [prefix];
    const seenPrefixes = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (seenPrefixes.has(current)) continue;
      seenPrefixes.add(current);

      const { data, error } = await supabase.storage
        .from(ICPA_CERTIFICATES_BUCKET)
        .list(current, {
          limit: 100,
          sortBy: { column: "name", order: "asc" },
        });
      if (error) continue;

      for (const entry of data ?? []) {
        const path = `${current}/${entry.name}`;
        if (entry.id == null) {
          queue.push(path);
        } else if (entry.name.toLowerCase().endsWith(".pdf")) {
          if (!found.has(path)) {
            found.set(path, toIcpaFile(path, folder));
          }
        }
      }
    }
  }

  return [...found.values()].sort((a, b) =>
    a.storagePath.localeCompare(b.storagePath, undefined, { numeric: true })
  );
}

/**
 * The three ICPA certificate slots for a member.
 * Files are expected at `icpa_certificates/{folder}/{membership_id}/*.pdf`.
 */
export async function listMemberIcpaCertificateSlots(
  supabase: SupabaseClient,
  membershipIdRaw: string | number
): Promise<IcpaCertificateSlot[]> {
  const variants = membershipIdVariantsForCerts(membershipIdRaw);
  if (!variants.length) {
    return ICPA_CERTIFICATE_TYPES.map((type) => ({
      key: type.key,
      label: type.label,
      folder: type.folder,
      file: null,
    }));
  }

  const slots = await Promise.all(
    ICPA_CERTIFICATE_TYPES.map(async (type) => {
      const files = await listPdfsInMemberFolder(
        supabase,
        type.folder,
        variants
      );
      return {
        key: type.key,
        label: type.label,
        folder: type.folder,
        file: files[0] ?? null,
      };
    })
  );

  return slots;
}

/** Flat list of all ICPA PDFs found across the three folders (admin / legacy). */
export async function listMemberIcpaCertificates(
  supabase: SupabaseClient,
  membershipIdRaw: string | number
): Promise<IcpaCertificateFile[]> {
  const slots = await listMemberIcpaCertificateSlots(supabase, membershipIdRaw);
  return slots
    .map((slot) => slot.file)
    .filter((file): file is IcpaCertificateFile => file != null);
}

/** Batch lookup for admin — grouped by membership ID. */
export async function listIcpaCertificatesForMembers(
  supabase: SupabaseClient,
  membershipIds: string[]
): Promise<Record<string, IcpaCertificateFile[]>> {
  const ids = [...new Set(membershipIds.map((id) => id.trim()).filter(Boolean))];
  const result: Record<string, IcpaCertificateFile[]> = Object.fromEntries(
    ids.map((id) => [id, []])
  );
  if (!ids.length) return result;

  await Promise.all(
    ids.map(async (id) => {
      result[id] = await listMemberIcpaCertificates(supabase, id);
    })
  );

  return result;
}
