"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { normalizeMembershipId } from "@/lib/membershipId";
import { supabase } from "@/lib/Supabase";
import { DEFAULT_CERTIFICATION_APPROVAL } from "@/lib/certificationApproval";
import { createFirebaseUser } from "@/lib/firebaseAdminClient";
import {
  Check,
  Eye,
  Loader2,
  Search,
  X,
  XCircle,
} from "lucide-react";

/**
 * Admin → New Member Requests
 *
 * Lists all rows in `new_member_request` with full details. The admin can:
 *  - Accept  → creates a Firebase Auth account (password from the request,
 *              falling back to the default "ictpi123"), inserts into
 *              memberinformation + candidate_exam_schedule +
 *              certification_approval + id_card_generated, and deletes the
 *              request row.
 *  - Reject  → deletes the request row only.
 */

interface RequestRow {
  id: number | string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  mobile_number: string | null;
  email: string | null;
  date_of_birth: string | null;
  password_hash: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  pincode: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_line3: string | null;
  member_category: string | null;
  membership_number: string | null;
  itp_enrollment_number: string | null;
  gstp_enrollment_number: string | null;
  itp_gstp_combined_enrollment: string | null;
  stp_vat_enrollment_number: string | null;
  cb_license_number: string | null;
  terms_accepted: boolean | null;
  created_at: string | null;
}

const NAVY = "#1e2659";
const PAGE_SIZES = [10, 25, 50, 100];

/** Default Firebase password when the request has none stored. */
const DEFAULT_MEMBER_PASSWORD = "ictpi123";

const SELECT_COLS =
  "id, first_name, middle_name, last_name, mobile_number, email, date_of_birth, password_hash, country, state, district, city, pincode, address_line1, address_line2, address_line3, member_category, membership_number, itp_enrollment_number, gstp_enrollment_number, itp_gstp_combined_enrollment, stp_vat_enrollment_number, cb_license_number, terms_accepted, created_at";

const SELECT_COLS_LEGACY =
  "id, first_name, middle_name, last_name, mobile_number, email, date_of_birth, password_hash, country, state, district, city, pincode, address_line1, address_line2, address_line3, member_category, membership_number, primary_applicable_license, licensed_custom_broker_cha, cha_registration_number, registered_investment_advisor, investment_advisor_registration_number, insolvency_practitioner, insolvency_registration_number, registered_sales_tax_vat_practitioner, sales_tax_registration_number, terms_accepted, created_at";

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function joinName(r: RequestRow) {
  return [r.first_name, r.middle_name, r.last_name]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

function joinAddress(r: RequestRow) {
  return [r.address_line1, r.address_line2, r.address_line3]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

function toRequestRow(x: Record<string, unknown>): RequestRow {
  return {
    id: String(x.id ?? ""),
    first_name: (x.first_name as string | null) ?? null,
    middle_name: (x.middle_name as string | null) ?? null,
    last_name: (x.last_name as string | null) ?? null,
    mobile_number: (x.mobile_number as string | null) ?? null,
    email: (x.email as string | null) ?? null,
    date_of_birth: (x.date_of_birth as string | null) ?? null,
    password_hash: (x.password_hash as string | null) ?? null,
    country: (x.country as string | null) ?? null,
    state: (x.state as string | null) ?? null,
    district: (x.district as string | null) ?? null,
    city: (x.city as string | null) ?? null,
    pincode: (x.pincode as string | null) ?? null,
    address_line1: (x.address_line1 as string | null) ?? null,
    address_line2: (x.address_line2 as string | null) ?? null,
    address_line3: (x.address_line3 as string | null) ?? null,
    member_category: (x.member_category as string | null) ?? null,
    membership_number: (x.membership_number as string | null) ?? null,
    itp_enrollment_number: (x.itp_enrollment_number as string | null) ?? null,
    gstp_enrollment_number: (x.gstp_enrollment_number as string | null) ?? null,
    itp_gstp_combined_enrollment:
      (x.itp_gstp_combined_enrollment as string | null) ?? null,
    stp_vat_enrollment_number:
      (x.stp_vat_enrollment_number as string | null) ?? null,
    cb_license_number: (x.cb_license_number as string | null) ?? null,
    terms_accepted: (x.terms_accepted as boolean | null) ?? null,
    created_at: (x.created_at as string | null) ?? null,
  };
}

export default function AdminNewRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const [viewing, setViewing] = useState<RequestRow | null>(null);
  const [confirming, setConfirming] = useState<{
    row: RequestRow;
    kind: "accept" | "reject";
  } | null>(null);
  const [busyId, setBusyId] = useState<RequestRow["id"] | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const buildQuery = (selectCols: string) => {
        let q = supabase
          .from("new_member_request")
          .select(selectCols, { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);
        const term = search.trim();
        if (term) {
          const like = `%${term}%`;
          q = q.or(
            [
              `first_name.ilike.${like}`,
              `last_name.ilike.${like}`,
              `email.ilike.${like}`,
              `mobile_number.ilike.${like}`,
              `state.ilike.${like}`,
              `city.ilike.${like}`,
              `member_category.ilike.${like}`,
            ].join(",")
          );
        }
        return q;
      };

      let { data, count, error } = await buildQuery(SELECT_COLS);
      if (error) {
        const msg = error.message ?? "";
        // Compatibility fallback for older schema that does not yet have the
        // new enrollment columns.
        if (/column .* does not exist|schema cache/i.test(msg)) {
          const legacy = await buildQuery(SELECT_COLS_LEGACY);
          data = legacy.data;
          count = legacy.count;
          error = legacy.error;
        }
      }
      if (error) throw error;

      const rowsRaw = ((data ?? []) as unknown[]).filter(
        (x): x is Record<string, unknown> =>
          Boolean(x) && typeof x === "object" && !Array.isArray(x)
      );
      setRows(rowsRaw.map(toRequestRow));
      setTotal(count ?? 0);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load new member requests.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

  const acceptRow = async (r: RequestRow) => {
    setBusyId(r.id);
    setToast(null);
    try {
      const email = (r.email ?? "").trim().toLowerCase();
      const password =
        (r.password_hash ?? "").toString().trim() || DEFAULT_MEMBER_PASSWORD;
      if (!email) {
        throw new Error("Email missing on this request.");
      }

      // 1) Create Firebase Auth user (secondary app — admin session untouched).
      try {
        await createFirebaseUser(email, password);
      } catch (err: unknown) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "";
        // If the account already exists in Firebase we still proceed with DB
        // inserts; otherwise we surface the failure to the admin.
        if (code !== "auth/email-already-in-use") throw err;
      }

      // 2) Use the Membership ID requested at registration.
      const normalized = normalizeMembershipId(r.membership_number ?? "");
      if (!normalized) {
        throw new Error("Invalid or missing Membership ID on this request.");
      }
      const newMembershipId = Number(normalized);
      const membershipIdStr = normalized;

      // Truncate every field to the exact varchar limits defined in the
      // candidate_exam_schedule schema.
      const fullName = (joinName(r) || "—").slice(0, 180);
      const place = (r.city ?? "").trim().slice(0, 100) || null;
      const stateVal = (r.state ?? "").trim().slice(0, 50) || null;
      const district = (r.district ?? "").trim().slice(0, 30) || null;
      const pincode = (r.pincode ?? "").trim().slice(0, 7) || null;
      const address = joinAddress(r).slice(0, 100) || null;
      const dob = r.date_of_birth ? String(r.date_of_birth).slice(0, 10) : null;
      const today = new Date().toISOString().slice(0, 10);

      // 3) memberinformation — schema: membership_id varchar(20), email
      //    varchar(200), name varchar(100). Required for email →
      //    membership_id lookup on the login flow.
      const memberInfoPayload = {
        membership_id: membershipIdStr.slice(0, 20),
        email: email.slice(0, 200),
        name: fullName.slice(0, 100) || null,
      };
      const { error: miErr } = await supabase
        .from("memberinformation")
        .insert(memberInfoPayload);
      if (miErr) {
        // 23505 = unique_violation — a row for this membership_id / email
        // already exists; we keep going so the candidate row still gets
        // created.
        const code = (miErr as { code?: string }).code;
        if (code !== "23505") {
          console.error("memberinformation insert failed:", miErr);
          throw new Error(
            "Could not insert into memberinformation: " +
              ((miErr as { message?: string }).message ?? "unknown error")
          );
        }
      }

      // 4) candidate_exam_schedule — only required columns + the optional
      //    columns we can derive from the request. The database itself fills
      //    in the workflow defaults (mepsc_assesment, next_step, etc).
      const itp =
        (r.itp_enrollment_number ?? "").trim() ||
        (r.itp_gstp_combined_enrollment ?? "").trim() ||
        null;
      const gstp =
        (r.gstp_enrollment_number ?? "").trim() ||
        (r.itp_gstp_combined_enrollment ?? "").trim() ||
        null;

      const candidatePayload = {
        membership_id: newMembershipId,
        name: fullName,
        place,
        state: stateVal,
        district,
        pincode,
        address,
        date_of_birth: dob,
        joined: today,
        gstp: gstp ? gstp.slice(0, 100) : null,
        ITP: itp ? itp.slice(0, 100) : null,
        STP: (r.stp_vat_enrollment_number ?? "").trim().slice(0, 100) || null,
        CB: (r.cb_license_number ?? "").trim().slice(0, 100) || null,
      };
      const { error: cesErr } = await supabase
        .from("candidate_exam_schedule")
        .insert(candidatePayload);
      if (cesErr) {
        console.error("candidate_exam_schedule insert failed:", cesErr);
        throw new Error(
          "Could not insert into candidate_exam_schedule: " +
            ((cesErr as { message?: string }).message ?? "unknown error")
        );
      }

      // 5) certification_approval — membership_id varchar(10). All approval
      //    and generated flags start at "0" (blocked / not generated) so the
      //    member shows up in Admin → Certificate Approvals.
      const approvalPayload = {
        membership_id: membershipIdStr.slice(0, 10),
        ...DEFAULT_CERTIFICATION_APPROVAL,
      };
      const { error: caErr } = await supabase
        .from("certification_approval")
        .insert(approvalPayload);
      if (caErr) {
        const code = (caErr as { code?: string }).code;
        // 23505 = row already exists for this membership_id — fine, keep going.
        if (code !== "23505") {
          console.error("certification_approval insert failed:", caErr);
          throw new Error(
            "Could not insert into certification_approval: " +
              ((caErr as { message?: string }).message ?? "unknown error")
          );
        }
      }

      // 6) id_card_generated — email varchar(100), name varchar(100),
      //    membership_id varchar(10). Used by the ID-card generation flow.
      const idCardPayload = {
        email: email.slice(0, 100),
        name: fullName.slice(0, 100) || null,
        membership_id: membershipIdStr.slice(0, 10),
      };
      const { error: idErr } = await supabase
        .from("id_card_generated")
        .insert(idCardPayload);
      if (idErr) {
        const code = (idErr as { code?: string }).code;
        if (code !== "23505") {
          console.error("id_card_generated insert failed:", idErr);
          throw new Error(
            "Could not insert into id_card_generated: " +
              ((idErr as { message?: string }).message ?? "unknown error")
          );
        }
      }

      // 7) Delete the original request.
      const { error: delErr } = await supabase
        .from("new_member_request")
        .delete()
        .eq("id", r.id);
      if (delErr) throw delErr;

      setToast({
        type: "ok",
        text: `Accepted ${email}. Membership ID ${newMembershipId} added to candidate_exam_schedule, memberinformation, certification_approval and id_card_generated; Firebase account created.`,
      });
      setConfirming(null);
      await load();
    } catch (e: unknown) {
      console.error("accept failed:", e);
      const msg =
        e instanceof Error ? e.message : "Could not accept this request.";
      setToast({ type: "err", text: msg });
    } finally {
      setBusyId(null);
    }
  };

  const rejectRow = async (r: RequestRow) => {
    setBusyId(r.id);
    setToast(null);
    try {
      const { error } = await supabase
        .from("new_member_request")
        .delete()
        .eq("id", r.id);
      if (error) throw error;
      setToast({ type: "ok", text: "Request rejected and removed." });
      setConfirming(null);
      await load();
    } catch (e: unknown) {
      console.error("reject failed:", e);
      const msg = e instanceof Error ? e.message : "Could not reject request.";
      setToast({ type: "err", text: msg });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell title="Admin Control Panel">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
        <h2 className="text-2xl font-bold text-[#1e2659] mb-2">
          New Member Requests
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Review pending requests from{" "}
          <span className="font-mono">new_member_request</span>. Accepting will
          provision a Firebase login and create candidate records.
        </p>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-end mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, mobile, state…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(searchInput);
              }}
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-80"
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
                <th className="px-3 py-3 text-left font-semibold">Name</th>
                <th className="px-3 py-3 text-left font-semibold">Email</th>
                <th className="px-3 py-3 text-left font-semibold">Mobile</th>
                <th className="px-3 py-3 text-left font-semibold">Place / State</th>
                <th className="px-3 py-3 text-left font-semibold">Category</th>
                <th className="px-3 py-3 text-left font-semibold">Received</th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading requests…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No pending requests.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={String(r.id)}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-3">{startIdx + i + 1}.</td>
                    <td className="px-3 py-3 font-medium">
                      {joinName(r) || "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{r.email || "—"}</td>
                    <td className="px-3 py-3 font-mono">
                      {r.mobile_number || "—"}
                    </td>
                    <td className="px-3 py-3">
                      {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-3">{r.member_category || "—"}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">
                      {fmtDateTime(r.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewing(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                          title="View details"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() =>
                            setConfirming({ row: r, kind: "accept" })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" /> Accept
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() =>
                            setConfirming({ row: r, kind: "reject" })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {viewing && (
        <DetailsModal
          row={viewing}
          onClose={() => setViewing(null)}
          onAccept={() => {
            setConfirming({ row: viewing, kind: "accept" });
            setViewing(null);
          }}
          onReject={() => {
            setConfirming({ row: viewing, kind: "reject" });
            setViewing(null);
          }}
        />
      )}

      {confirming && (
        <ConfirmModal
          row={confirming.row}
          kind={confirming.kind}
          busy={busyId === confirming.row.id}
          onCancel={() => setConfirming(null)}
          onConfirm={() =>
            confirming.kind === "accept"
              ? acceptRow(confirming.row)
              : rejectRow(confirming.row)
          }
        />
      )}
    </AdminShell>
  );
}

/* ---------- Details Modal ---------- */

function DetailsModal({
  row,
  onClose,
  onAccept,
  onReject,
}: {
  row: RequestRow;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "First Name", value: row.first_name || "—" },
    { label: "Middle Name", value: row.middle_name || "—" },
    { label: "Last Name", value: row.last_name || "—" },
    { label: "Email", value: row.email || "—" },
    { label: "Mobile", value: row.mobile_number || "—" },
    { label: "Date of Birth", value: row.date_of_birth || "—" },
    { label: "Country", value: row.country || "—" },
    { label: "State", value: row.state || "—" },
    { label: "District", value: row.district || "—" },
    { label: "City", value: row.city || "—" },
    { label: "Pincode", value: row.pincode || "—" },
    { label: "Address Line 1", value: row.address_line1 || "—" },
    { label: "Address Line 2", value: row.address_line2 || "—" },
    { label: "Address Line 3", value: row.address_line3 || "—" },
    { label: "Member Category", value: row.member_category || "—" },
    { label: "Membership ID", value: row.membership_number || "—" },
    {
      label: "ITP Enrollment No.",
      value: row.itp_enrollment_number || "—",
    },
    {
      label: "GSTP Enrollment No.",
      value: row.gstp_enrollment_number || "—",
    },
    {
      label: "ITP / GSTP Combined Enrollment",
      value: row.itp_gstp_combined_enrollment || "—",
    },
    { label: "STP/VAT", value: row.stp_vat_enrollment_number || "—" },
    { label: "CB License No.", value: row.cb_license_number || "—" },
    { label: "Terms Accepted", value: row.terms_accepted ? "Yes" : "No" },
    { label: "Received", value: fmtDateTime(row.created_at) },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        <div
          className="px-5 py-4 flex items-center justify-between rounded-t-2xl text-white"
          style={{ background: NAVY }}
        >
          <div>
            <h3 className="text-lg font-bold">Request Details</h3>
            <p className="text-xs text-white/80">{row.email || "—"}</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md hover:bg-white/10 flex items-center justify-center"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 md:p-7 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {fields.map((f) => (
              <div key={f.label} className="border-b border-slate-100 pb-2">
                <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  {f.label}
                </p>
                <p className="text-sm text-slate-800 break-words">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onReject}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
          >
            <XCircle className="h-4 w-4" /> Reject
          </button>
          <button
            onClick={onAccept}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            <Check className="h-4 w-4" /> Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Confirm Modal ---------- */

function ConfirmModal({
  row,
  kind,
  busy,
  onCancel,
  onConfirm,
}: {
  row: RequestRow;
  kind: "accept" | "reject";
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isAccept = kind === "accept";
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">
            {isAccept ? "Accept this request?" : "Reject this request?"}
          </h3>
        </div>
        <div className="px-5 py-4 text-sm text-slate-600">
          {isAccept ? (
            <>
              A Firebase login will be created for{" "}
              <span className="font-mono">{row.email}</span> (default password{" "}
              <span className="font-mono">ictpi123</span> if none was set) and
              records will be added to{" "}
              <span className="font-mono">candidate_exam_schedule</span>,{" "}
              <span className="font-mono">memberinformation</span>,{" "}
              <span className="font-mono">certification_approval</span> and{" "}
              <span className="font-mono">id_card_generated</span>.
            </>
          ) : (
            <>
              The request from <span className="font-mono">{row.email}</span>{" "}
              will be permanently deleted.
            </>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 ${
              isAccept
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {isAccept ? "Yes, Accept" : "Yes, Reject"}
          </button>
        </div>
      </div>
    </div>
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
