"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import {
  ALL_APPROVAL_COLS,
  CERTIFICATION_APPROVAL_SELECT,
  GENERATED_FLAG_COLS,
  type ApprovalColumnKey,
  type CertificationApprovalRow,
  isCertificationApproved,
} from "@/lib/certificationApproval";
import { Loader2, RefreshCw, Save, Search, ExternalLink } from "lucide-react";

/**
 * Admin → Certificate Approvals
 *
 * One row per membership_id in `certification_approval`. The admin can:
 *   - Toggle standard and ICPA approval flags ("1" = allowed, "0" = blocked).
 *   - Reset the four standard "_generated" flags back to "0".
 */

type ApprovalRow = CertificationApprovalRow;

interface MemberLite {
  membership_id: string | number;
  name: string | null;
  email: string | null;
}

interface StoredCertLink {
  title: string;
  storagePath: string;
  url: string;
  folder?: string;
}

interface MemberStoredCerts {
  common: StoredCertLink[];
  icpa: StoredCertLink[];
}

const NAVY = "#1e2659";
const PAGE_SIZES = [10, 25, 50, 100];

const APPROVAL_COLS = ALL_APPROVAL_COLS;
const GENERATED_COLS = GENERATED_FLAG_COLS;

const isOne = isCertificationApproved;

export default function CertificateApprovalsPage() {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [memberMap, setMemberMap] = useState<
    Record<string, { name: string; email: string }>
  >({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<
    { type: "ok" | "err"; text: string } | null
  >(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [storedCerts, setStoredCerts] = useState<
    Record<string, MemberStoredCerts>
  >({});
  const [storedCertsLoading, setStoredCertsLoading] = useState(false);

  /** Local edits keyed by membership_id (only approval columns are draftable). */
  const [drafts, setDrafts] = useState<
    Record<string, Partial<Pick<ApprovalRow, ApprovalColumnKey>>>
  >({});

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = useMemo(() => (page - 1) * pageSize, [page, pageSize]);
  const tableColSpan = 4 + APPROVAL_COLS.length + 3;

  const loadStoredCerts = useCallback(async (ids: string[]) => {
    if (!ids.length) {
      setStoredCerts({});
      return;
    }
    setStoredCertsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/member-stored-certificates?membershipIds=${encodeURIComponent(ids.join(","))}`,
        { cache: "no-store" }
      );
      const body = (await res.json().catch(() => ({}))) as {
        common?: Record<string, StoredCertLink[]>;
        icpa?: Record<string, StoredCertLink[]>;
      };
      if (!res.ok) {
        setStoredCerts({});
        return;
      }
      const map: Record<string, MemberStoredCerts> = {};
      for (const id of ids) {
        map[id] = {
          common: body.common?.[id] ?? [],
          icpa: body.icpa?.[id] ?? [],
        };
      }
      setStoredCerts(map);
    } catch {
      setStoredCerts({});
    } finally {
      setStoredCertsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from("certification_approval")
        .select(CERTIFICATION_APPROVAL_SELECT, { count: "exact" })
        .order("membership_id", { ascending: true })
        .range(from, to);

      const term = search.trim();
      if (term) {
        q = q.ilike("membership_id", `%${term}%`);
      }

      const { data, count, error } = await q;
      if (error) throw error;

      const list = (data as unknown as ApprovalRow[]) ?? [];
      setRows(list);
      setTotal(count ?? 0);
      setDrafts({});

      // Resolve member name/email for the current page.
      const ids = Array.from(
        new Set(
          list
            .map((r) => (r.membership_id ?? "").trim())
            .filter((s) => s.length > 0)
        )
      );

      if (ids.length > 0) {
        const asNumbers = ids
          .map((s) => Number(s))
          .filter((n) => Number.isFinite(n));

        const queries = [
          supabase
            .from("memberinformation")
            .select("membership_id, name, email")
            .in("membership_id", ids),
        ];
        if (asNumbers.length > 0) {
          queries.push(
            supabase
              .from("memberinformation")
              .select("membership_id, name, email")
              .in("membership_id", asNumbers)
          );
        }
        const results = await Promise.all(queries);
        const map: Record<string, { name: string; email: string }> = {};
        results.forEach((res) => {
          (res.data as MemberLite[] | null | undefined)?.forEach((m) => {
            map[String(m.membership_id)] = {
              name: m.name ?? "",
              email: m.email ?? "",
            };
          });
        });
        setMemberMap(map);
        await loadStoredCerts(ids);
      } else {
        setMemberMap({});
        setStoredCerts({});
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load certificate approvals.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, loadStoredCerts]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

  /** Effective value for a row's approval column (draft if set, else DB value). */
  const effective = (r: ApprovalRow, key: ApprovalColumnKey) => {
    const id = r.membership_id ?? "";
    const draft = drafts[id]?.[key];
    return draft !== undefined ? draft : r[key];
  };

  const hasChanges = (r: ApprovalRow) => {
    const id = r.membership_id ?? "";
    const d = drafts[id];
    if (!d) return false;
    return APPROVAL_COLS.some((c) => d[c.key] !== undefined && d[c.key] !== r[c.key]);
  };

  const toggleApproval = (r: ApprovalRow, key: ApprovalColumnKey) => {
    const id = r.membership_id ?? "";
    if (!id) return;
    const next = isOne(effective(r, key)) ? "0" : "1";
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), [key]: next },
    }));
  };

  const saveRow = async (r: ApprovalRow) => {
    const id = r.membership_id ?? "";
    if (!id) return;
    setBusyKey(`save:${id}`);
    setToast(null);
    try {
      const d = drafts[id];
      if (!d) return;
      const payload: Partial<ApprovalRow> = {};
      APPROVAL_COLS.forEach((c) => {
        if (d[c.key] !== undefined) payload[c.key] = d[c.key] ?? null;
      });

      const { error } = await supabase
        .from("certification_approval")
        .update(payload)
        .eq("membership_id", id);
      if (error) throw error;

      setRows((prev) =>
        prev.map((row) =>
          row.membership_id === id ? { ...row, ...payload } : row
        )
      );
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setToast({ type: "ok", text: `Saved approvals for ${id}.` });
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to save.";
      setToast({ type: "err", text: msg });
    } finally {
      setBusyKey(null);
    }
  };

  const resetGenerated = async (r: ApprovalRow) => {
    const id = r.membership_id ?? "";
    if (!id) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Reset all "generated" flags for ${id}? Stored certificate files in bucket will also be deleted.`
      )
    ) {
      return;
    }
    setBusyKey(`reset:${id}`);
    setToast(null);
    try {
      // 1) Remove stored certificate files for this member from storage.
      const delRes = await fetch("/api/admin/delete-member-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: id }),
      });
      const delJson = await delRes.json().catch(() => ({}));
      if (!delRes.ok) {
        throw new Error(
          typeof delJson.error === "string"
            ? delJson.error
            : "Failed to delete stored certificates."
        );
      }

      // 2) Reset generated flags in DB.
      const payload: Partial<ApprovalRow> = {
        skill_india_generated: "0",
        ncvet_generated: "0",
        membership_cert_generated: "0",
        practicing_generated: "0",
      };
      const { error } = await supabase
        .from("certification_approval")
        .update(payload)
        .eq("membership_id", id);
      if (error) throw error;

      setRows((prev) =>
        prev.map((row) =>
          row.membership_id === id ? { ...row, ...payload } : row
        )
      );
      const deletedCount =
        typeof delJson.deleted === "number" ? delJson.deleted : 0;
      setToast({
        type: "ok",
        text: `Reset generation flags for ${id}. Deleted ${deletedCount} stored certificate file(s).`,
      });
      const pageIds = rows
        .map((r) => (r.membership_id ?? "").trim())
        .filter(Boolean);
      if (pageIds.length) await loadStoredCerts(pageIds);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to reset.";
      setToast({ type: "err", text: msg });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <AdminShell title="Admin Control Panel">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
        <h2 className="text-2xl font-bold text-[#1e2659] mb-2">
          Certificate Approvals
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Toggle download permissions per certificate (standard and ICPA), or
          reset the “generated” flags so a member can download again. Source:{" "}
          <span className="font-mono">certification_approval</span>.
        </p>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-end mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by membership ID…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(searchInput);
              }}
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-72"
            />
          </div>
        </div>

        {toast && (
          <div
            className={`mb-4 rounded-lg px-4 py-2 text-sm ${
              toast.type === "ok"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {toast.text}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="px-3 py-3 text-left font-semibold">SR. NO</th>
                <th className="px-3 py-3 text-left font-semibold">
                  Membership ID
                </th>
                <th className="px-3 py-3 text-left font-semibold">Name</th>
                <th className="px-3 py-3 text-left font-semibold">Email</th>
                {APPROVAL_COLS.map((c) => (
                  <th
                    key={c.key}
                    className="px-3 py-3 text-center font-semibold"
                    title={`Allow ${c.label} download`}
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-semibold">
                  Already generated
                </th>
                <th className="px-3 py-3 text-left font-semibold min-w-[200px]">
                  Stored PDFs
                </th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={tableColSpan}
                    className="py-10 text-center text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading approvals…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableColSpan}
                    className="py-10 text-center text-slate-500"
                  >
                    No certification rows found.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const id = r.membership_id ?? "";
                  const meta = memberMap[id];
                  const dirty = hasChanges(r);
                  return (
                    <tr
                      key={`${id}-${i}`}
                      className="border-t border-slate-100 hover:bg-slate-50 align-middle"
                    >
                      <td className="px-3 py-3">{startIdx + i + 1}.</td>
                      <td className="px-3 py-3 font-mono">{id || "—"}</td>
                      <td className="px-3 py-3">{meta?.name || "—"}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {meta?.email || "—"}
                      </td>
                      {APPROVAL_COLS.map((c) => {
                        const on = isOne(effective(r, c.key));
                        return (
                          <td key={c.key} className="px-3 py-3 text-center">
                            <ToggleSwitch
                              checked={on}
                              onChange={() => toggleApproval(r, c.key)}
                              label={c.label}
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap justify-center gap-1">
                          {GENERATED_COLS.map((g) => {
                            const on = isOne(r[g.key]);
                            return (
                              <span
                                key={g.key}
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  on
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                                title={`${g.label} generated`}
                              >
                                {g.label}: {on ? "Yes" : "No"}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        {storedCertsLoading ? (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading…
                          </span>
                        ) : (
                          <StoredCertsCell stored={storedCerts[id]} />
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!dirty || busyKey === `save:${id}`}
                            onClick={() => saveRow(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1e2659] text-white text-xs font-semibold hover:opacity-95 disabled:opacity-50"
                          >
                            {busyKey === `save:${id}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            Save
                          </button>
                          <button
                            type="button"
                            disabled={busyKey === `reset:${id}`}
                            onClick={() => resetGenerated(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 disabled:opacity-50"
                            title="Reset generated flags so the member can download again"
                          >
                            {busyKey === `reset:${id}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing {total === 0 ? 0 : startIdx + 1} to{" "}
              {Math.min(startIdx + pageSize, total)} of {total} rows
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="ml-3 rounded-md border border-slate-200 px-2 py-1 text-sm"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>rows per page</span>
          </div>
          <Pager
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </AdminShell>
  );
}

void NAVY;

function StoredCertsCell({ stored }: { stored?: MemberStoredCerts }) {
  const common = stored?.common ?? [];
  const icpa = stored?.icpa ?? [];
  if (!common.length && !icpa.length) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const renderGroup = (label: string, items: StoredCertLink[]) => {
    if (!items.length) return null;
    return (
      <div className="mb-2 last:mb-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
          {label}
        </p>
        <ul className="space-y-1">
          {items.map((c) => (
            <li key={c.storagePath}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline"
                title={c.storagePath}
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[160px]">
                  {c.folder ? `${c.folder}/` : ""}
                  {c.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      {renderGroup("Common", common)}
      {renderGroup("ICPA", icpa)}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Toggle ${label}`}
      onClick={onChange}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ---------- Pager ---------- */

function Pager({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages: (number | "…")[] = [];
  const push = (n: number | "…") => pages.push(n);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
  } else {
    push(1);
    if (page > 3) push("…");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) push(i);
    if (page < totalPages - 2) push("…");
    push(totalPages);
  }
  return (
    <div className="flex items-center gap-1">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2 py-1 rounded-md border border-slate-200 disabled:opacity-40"
      >
        ‹
      </button>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`e-${idx}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-7 w-7 rounded-md text-xs font-semibold ${
              p === page
                ? "bg-[#1e2659] text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-2 py-1 rounded-md border border-slate-200 disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
