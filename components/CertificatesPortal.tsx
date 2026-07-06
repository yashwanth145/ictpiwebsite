"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  Download,
} from "lucide-react";
import Image from "next/image";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import {
  formatCertificateIssueDate,
  formatMembershipIdDisplay,
  formatPracticingCertificateNo,
} from "@/lib/membershipId";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";
import { supabase } from "@/lib/Supabase";
import { loadMemberProfileByMembershipId } from "@/lib/candidateExamSchedule";
import { PRACTICING_CERT_TEMPLATE_URL } from "@/lib/certificateTemplate";
import { getStoredMembershipId } from "@/lib/memberSession";
import type { IcpaCertificateSlot } from "@/lib/icpaCertificateStorage";
import {
  ICPA_CERTIFICATE_TYPES,
  icpaApprovalColumnForKey,
} from "@/lib/icpaCertificateStorage";
import type { CommonCertificateFile } from "@/lib/commonCertificateStorage";
import {
  CERTIFICATION_APPROVAL_SELECT,
  type CertificationApprovalRow,
  isCertificationApproved,
} from "@/lib/certificationApproval";

/**
 * Logical certificate keys used in the UI. Each maps to:
 *  - the `certification_approval` column that gates eligibility ("1" = allowed)
 *  - the `*_generated` column that records whether the PDF was already issued.
 *
 * Column names match the user's schema exactly:
 *   skill_india        + skill_india_generated
 *   ncvet              + ncvet_generated
 *   ctpr_membership    + membership_cert_generated   (different suffix)
 *   practicing         + practicing_generated
 */
type CertKey = "skill_india" | "ncvet" | "ctpr_membership" | "practicing";

interface CertConfig {
  key: CertKey;
  approvalCol: CertKey;
  generatedCol:
    | "skill_india_generated"
    | "ncvet_generated"
    | "membership_cert_generated"
    | "practicing_generated";
  label: string;
  image: string;
  note: string;
  /** Whether we have a working PDF generator for this certificate today. */
  hasGenerator: boolean;
}

const CERTS: CertConfig[] = [
  {
    key: "skill_india",
    approvalCol: "skill_india",
    generatedCol: "skill_india_generated",
    label: "Skill India Marksheet",
    image: "/images/skill-india.svg",
    note: "Awaiting official issuance from Skill India.",
    hasGenerator: false,
  },
  {
    key: "ncvet",
    approvalCol: "ncvet",
    generatedCol: "ncvet_generated",
    label: "NCVET Qualification Certificate",
    image: "/images/nvcet.svg",
    note: "Awaiting official issuance from NCVET.",
    hasGenerator: false,
  },
  {
    key: "ctpr_membership",
    approvalCol: "ctpr_membership",
    generatedCol: "membership_cert_generated",
    label: "CTPr (ICTPI) Membership Certificate",
    image: "/images/ICTPL_image.jpg",
    note: "ICTPI membership certificate.",
    hasGenerator: false,
  },
  {
    key: "practicing",
    approvalCol: "practicing",
    generatedCol: "practicing_generated",
    label: "Practicing Member Certificate",
    image: "/images/ICTPL_image.jpg",
    note: "Issued to approved practicing members.",
    hasGenerator: true,
  },
];

const ICPA_SLOT_IMAGES: Record<
  (typeof ICPA_CERTIFICATE_TYPES)[number]["key"],
  string
> = {
  skill_india: "/images/skill-india.svg",
  marksheet: "/images/ICTPL_image.jpg",
  icpa_cert: "/images/ICTPL_image.jpg",
};

interface ApprovalRow extends CertificationApprovalRow {}

const isApproved = isCertificationApproved;

function practicingCertificatePath(membershipId: number) {
  const year = new Date().getFullYear();
  return `${year}/${membershipId}.pdf`;
}

function practicingBucketRootPath(membershipId: number) {
  return `${membershipId}.pdf`;
}

const PRACTICING_STORAGE_TARGETS = [
  // Primary path as requested in screenshots:
  // bucket "certificates" -> "practicing/<year>/<membershipId>.pdf"
  { bucket: "certificates", pathOf: (membershipId: number) => `practicing/${practicingCertificatePath(membershipId)}` },
  // Legacy path kept for backward compatibility with older generated files.
  {
    bucket: "certificates",
    pathOf: (membershipId: number) =>
      `ictpi/practicing_member_certificate/${new Date().getFullYear()}/${membershipId}.pdf`,
  },
  { bucket: "certificates", pathOf: (membershipId: number) => `practicing/${new Date().getFullYear()}/${membershipId}.pdf` },
  { bucket: "certificates", pathOf: (membershipId: number) => `practicing/${practicingBucketRootPath(membershipId)}` },
] as const;

/** Values drawn next to the template’s Certificate No. / NCVET / GSTP / … labels */
interface CandidateCertFields {
  NCVET: string | null;
  gstp: string | null;
  ITP: string | null;
  SIDH: string | null;
  STP: string | null;
  CB: string | null;
}

function parseCandidateCertRow(row: Record<string, unknown> | null): CandidateCertFields {
  if (!row) {
    return {
      NCVET: null,
      gstp: null,
      ITP: null,
      SIDH: null,
      STP: null,
      CB: null,
    };
  }
  const s = (k: string) => {
    const v = row[k];
    if (v === null || v === undefined) return null;
    const t = String(v).trim();
    return t.length ? t : null;
  };
  return {
    NCVET: s("NCVET") ?? s("ncvet"),
    gstp: s("gstp"),
    ITP: s("ITP") ?? s("itp"),
    SIDH: s("SIDH") ?? s("sidh"),
    STP: s("STP") ?? s("stp"),
    CB: s("CB") ?? s("cb"),
  };
}

export function CertificatesPortal({
  isPremium: isPremiumRoute = false,
}: {
  isPremium?: boolean;
}) {
  const auth = useAuth() as any;
  const { isPremium: portalPremium } = usePortalMode();
  const isPremium = isPremiumRoute || portalPremium;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [approval, setApproval] = useState<ApprovalRow | null>(null);
  const [candidateName, setCandidateName] = useState<string>("");
  const [candidateCertFields, setCandidateCertFields] =
    useState<CandidateCertFields | null>(null);
  const [membershipIdNum, setMembershipIdNum] = useState<number | null>(null);
  const [busyKey, setBusyKey] = useState<CertKey | null>(null);
  const [toast, setToast] = useState<{
    kind: "success" | "info" | "error";
    text: string;
  } | null>(null);
  const [icpaSlots, setIcpaSlots] = useState<IcpaCertificateSlot[]>([]);
  const [icpaLoading, setIcpaLoading] = useState(false);
  const [commonCertificates, setCommonCertificates] = useState<
    CommonCertificateFile[]
  >([]);
  const [commonLoading, setCommonLoading] = useState(false);

  const downloadStoredPracticingCertificate = async () => {
    if (!membershipIdNum) return;
    for (const target of PRACTICING_STORAGE_TARGETS) {
      const path = target.pathOf(membershipIdNum);
      const { data, error } = await supabase.storage
        .from(target.bucket)
        .download(path);
      if (error || !data) continue;
      const blobUrl = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Practicing-Certificate-${String(membershipIdNum).padStart(
        5,
        "0"
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      return;
    }
    throw new Error(
      "Stored certificate not found. Please generate it again or contact support."
    );
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    if (!auth?.user?.email) return;
    const email = auth.user.email.toLowerCase().trim();

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data: payload, error: loadErr } =
          await loadMemberProfileByMembershipId(supabase, getStoredMembershipId());
        if (loadErr || !payload?.member?.membership_id) {
          throw new Error(
            loadErr ?? "No membership record was found for your account."
          );
        }

        const member = payload.member;
        const candidateProfile = payload.candidate;

        const midNum = candidateProfile?.membership_id
          ? Number(candidateProfile.membership_id)
          : Number(String(member.membership_id).replace(/\D/g, ""));
        if (!Number.isFinite(midNum)) {
          setErrorMsg("Invalid membership ID on your account.");
          return;
        }
        setMembershipIdNum(midNum);

        const resolvedName =
          candidateProfile?.name?.trim() || member.name?.trim() || "";
        setCandidateName(resolvedName);
        setCandidateCertFields(
          parseCandidateCertRow(
            (candidateProfile as unknown as Record<string, unknown> | null) ??
              null
          )
        );

        // 3) Fetch the approval row.
        // certification_approval.membership_id is varchar(10), so query both
        // as string and zero-padded forms to be safe.
        const midStr = String(midNum);
        const midPadded = midStr.padStart(5, "0");

        const { data: approvalRows, error: approvalErr } = await supabase
          .from("certification_approval")
          .select(CERTIFICATION_APPROVAL_SELECT)
          .in("membership_id", [midStr, midPadded]);

        if (approvalErr) throw approvalErr;

        setApproval((approvalRows?.[0] as ApprovalRow) ?? null);

        if (isPremiumRoute) {
          setIcpaLoading(true);
          setCommonCertificates([]);
          try {
            const res = await fetch(
              `/api/member-icpa-certificates?membershipId=${encodeURIComponent(String(midNum))}`,
              { cache: "no-store" }
            );
            const body = (await res.json().catch(() => ({}))) as {
              slots?: IcpaCertificateSlot[];
            };
            if (res.ok) {
              setIcpaSlots(
                body.slots ??
                  ICPA_CERTIFICATE_TYPES.map((type) => ({
                    key: type.key,
                    label: type.label,
                    folder: type.folder,
                    file: null,
                  }))
              );
            } else {
              setIcpaSlots(
                ICPA_CERTIFICATE_TYPES.map((type) => ({
                  key: type.key,
                  label: type.label,
                  folder: type.folder,
                  file: null,
                }))
              );
            }
          } catch {
            setIcpaSlots(
              ICPA_CERTIFICATE_TYPES.map((type) => ({
                key: type.key,
                label: type.label,
                folder: type.folder,
                file: null,
              }))
            );
          } finally {
            setIcpaLoading(false);
          }
        } else {
          setIcpaSlots([]);
          setCommonLoading(true);
          try {
            const res = await fetch(
              `/api/member-common-certificates?membershipId=${encodeURIComponent(String(midNum))}`,
              { cache: "no-store" }
            );
            const body = (await res.json().catch(() => ({}))) as {
              certificates?: CommonCertificateFile[];
            };
            if (res.ok) {
              setCommonCertificates(body.certificates ?? []);
            } else {
              setCommonCertificates([]);
            }
          } catch {
            setCommonCertificates([]);
          } finally {
            setCommonLoading(false);
          }
        }
      } catch (err: any) {
        console.error("Failed to load certificate state:", err);
        setErrorMsg(
          "Failed to load certification status. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auth?.user?.email, isPremiumRoute]);

  const resolvedCerts = useMemo(
    () =>
      CERTS.map((c) => ({
        ...c,
        image: getPortalAssetPath(c.image, isPremium),
      })),
    [isPremium]
  );

  /**
   * Generates the Practicing Member Certificate PDF.
   * Loads the blank template from public/cert (copied from app/cert at build), draws the
   * candidate's name and membership ID onto the first page, marks the DB flag, and triggers a
   * browser download.
   */
  const generatePracticingCertificate = async () => {
    if (!candidateName) {
      setToast({
        kind: "error",
        text: "Your name is missing in the candidate record. Please update your profile first.",
      });
      return;
    }
    if (!membershipIdNum) {
      setToast({
        kind: "error",
        text: "Membership ID unavailable. Please re-login.",
      });
      return;
    }
    if (!approval) {
      setToast({
        kind: "error",
        text: "No approval record found for your account.",
      });
      return;
    }

    const certForCheck = candidateCertFields ?? parseCandidateCertRow(null);
    const itpVal = (certForCheck.ITP ?? "").trim();
    const gstpVal = (certForCheck.gstp ?? "").trim();
    if (!itpVal && !gstpVal) {
      setToast({
        kind: "error",
        text:
          "At least one of ITP or GSTP enrollment number is required to generate your certificate. Please add it in your profile or during registration.",
      });
      return;
    }

    setBusyKey("practicing");
    try {
      // Lazy-load pdf-lib to keep the page bundle small.
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      // First-time generation uses the static template (not a stored certificate).
      const res = await fetch(PRACTICING_CERT_TEMPLATE_URL);
      if (!res.ok) {
        throw new Error(
          "Certificate template could not be loaded. Ensure app/cert/practicing-certificate.pdf exists."
        );
      }
      const templateBytes = await res.arrayBuffer();

      const pdfDoc = await PDFDocument.load(templateBytes);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const [firstPage] = pdfDoc.getPages();
      const { width, height } = firstPage.getSize();

      const ink = rgb(0.04, 0.12, 0.27);

      const drawIf = (
        text: string | null | undefined,
        x: number,
        y: number,
        size: number,
        font: typeof helvetica,
        maxWidth?: number
      ) => {
        const t = (text ?? "").trim();
        if (!t) return;
        let s = t;
        if (maxWidth && font.widthOfTextAtSize(s, size) > maxWidth) {
          while (s.length > 1 && font.widthOfTextAtSize(`${s}…`, size) > maxWidth) {
            s = s.slice(0, -1);
          }
          s = `${s}…`;
        }
        firstPage.drawText(s, { x, y, size, font, color: ink });
      };

      const cert = candidateCertFields ?? parseCandidateCertRow(null);
      // Certificate No.: <last3>/<year>/<membershipId> (e.g. 799/2026/101799).
      const certificateNo = formatPracticingCertificateNo(membershipIdNum);
      const issueDate = formatCertificateIssueDate();

      // Empty / unknown enrollment fields render as "---" on the certificate.
      const fallback = (v: string | null | undefined) => {
        const t = (v ?? "").trim();
        return t.length ? t : "---";
      };

      // ----- Field placement (PDF origin = bottom-left) -----
      // The PMC template prints labels in the LOWER half of the page; the name
      // sits on its own blank line above "A Fellow of the Institute / Having
      // Membership Number ...". Tune the constants below if pixels are off.

      // Candidate name — sits on the blank line under "This is to Certify
      // that," with a touch more headroom from the captions below.
      const NAME_FONT_SIZE = 18;
      const NAME_Y = height * 0.618;
      const nameWidth = helveticaBold.widthOfTextAtSize(
        candidateName,
        NAME_FONT_SIZE
      );
      firstPage.drawText(candidateName, {
        x: (width - nameWidth) / 2,
        y: NAME_Y,
        size: NAME_FONT_SIZE,
        font: helveticaBold,
        color: ink,
      });

      // Membership ID — inline after the printed "having Membership Number" label.
      const membershipIdText = formatMembershipIdDisplay(membershipIdNum);
      const MEMBERSHIP_FONT_SIZE = 16;
      const MEMBERSHIP_Y = height * 0.568;
      firstPage.drawText(membershipIdText, {
        x: width * 0.537,
        y: MEMBERSHIP_Y,
        size: MEMBERSHIP_FONT_SIZE,
        font: helveticaBold,
        color: ink,
      });

      // ----- Bottom block: Certificate No. + 6 enrollment fields -----
      // The printed labels sit roughly in the lower fifth of the page.
      // X positions are the right side of each label (where the colon ends).

      // Certificate No.: <last3>/<year>/<membershipId>
      const CERT_NO_SIZE = 12;
      firstPage.drawText(certificateNo, {
        x: width * 0.495,
        y: height * 0.182,
        size: CERT_NO_SIZE,
        font: helveticaBold,
        color: ink,
      });

      // Certificate generated date — aligned with
      // "Certificate Generated Date:" in the mid-left area of template.
      const DATE_SIZE = 11;
      firstPage.drawText(issueDate, {
        x: width * 0.302,
        y: height * 0.360,
        size: DATE_SIZE,
        font: helveticaBold,
        color: ink,
      });

      // Two-column enrollment grid — bold, sitting on the same baseline as
      // each printed label. Empty values render as "---".
      const DETAIL_SIZE = 9;
      const rowGap = height * 0.020;
      const detailBaselineNudge = -3.2;
      const row1Y = height * 0.168 + detailBaselineNudge;
      const leftValX = width * 0.295;
      const rightValX = width * 0.74;
      const leftMaxW = width * 0.22;
      const rightMaxW = width * 0.22;

      drawIf(fallback(cert.NCVET), leftValX, row1Y, DETAIL_SIZE, helveticaBold, leftMaxW);
      drawIf(fallback(cert.SIDH), rightValX, row1Y, DETAIL_SIZE, helveticaBold, rightMaxW);

      drawIf(fallback(cert.gstp), leftValX, row1Y - rowGap, DETAIL_SIZE, helveticaBold, leftMaxW);
      drawIf(fallback(cert.STP), rightValX, row1Y - rowGap, DETAIL_SIZE, helveticaBold, rightMaxW);

      drawIf(fallback(cert.ITP), leftValX, row1Y - 2 * rowGap, DETAIL_SIZE, helveticaBold, leftMaxW);
      drawIf(fallback(cert.CB), 1.015*rightValX, row1Y - 2 * rowGap, DETAIL_SIZE, helveticaBold, rightMaxW);

      const pdfBytes = await pdfDoc.save();

      // 1) Upload the generated PDF to storage so repeat downloads can use
      // the same immutable file instead of regenerating.
      const arrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const uploadErrors: string[] = [];
      let uploadedCount = 0;
      for (let i = 0; i < PRACTICING_STORAGE_TARGETS.length; i += 1) {
        const target = PRACTICING_STORAGE_TARGETS[i];
        const path = target.pathOf(membershipIdNum);
        const { error: uploadErr } = await supabase.storage
          .from(target.bucket)
          .upload(path, blob, {
            contentType: "application/pdf",
            upsert: true,
            cacheControl: "31536000",
          });
        if (uploadErr) {
          const msg = uploadErr.message ?? "";
          uploadErrors.push(`${target.bucket}/${path}: ${msg}`);
        } else {
          uploadedCount += 1;
        }
      }
      if (uploadedCount === 0) {
        throw new Error(
          `Could not upload certificate to any configured path. ${uploadErrors.join(" | ")}`
        );
      }

      // 2) Mark the DB row. If optional path columns do not exist yet,
      // fallback to generated flag only.
      const targetMembershipId = approval.membership_id ?? String(membershipIdNum);
      const primaryTarget = PRACTICING_STORAGE_TARGETS[0];
      const primaryPath = primaryTarget.pathOf(membershipIdNum);
      const { data: pub } = supabase.storage
        .from(primaryTarget.bucket)
        .getPublicUrl(primaryPath);
      let { error: updateErr } = await supabase
        .from("certification_approval")
        .update({
          practicing_generated: "1",
          // Optional columns; this update may fail in older schemas.
          practicing_certificate_path: `${primaryTarget.bucket}/${primaryPath}`,
          practicing_certificate_url: pub.publicUrl,
        } as Record<string, string>)
        .eq("membership_id", targetMembershipId);

      if (updateErr) {
        const msg = updateErr.message ?? "";
        if (/column .* does not exist|schema cache/i.test(msg)) {
          const retry = await supabase
            .from("certification_approval")
            .update({ practicing_generated: "1" })
            .eq("membership_id", targetMembershipId);
          updateErr = retry.error;
        }
      }
      if (updateErr) {
        throw updateErr;
      }

      // 3) Download the uploaded file.
      await downloadStoredPracticingCertificate();

      // 4) Reflect new state locally.
      setApproval((prev) =>
        prev ? { ...prev, practicing_generated: "1" } : prev
      );

      setToast({
        kind: "success",
        text: "Certificate generated and stored successfully.",
      });
    } catch (err: any) {
      console.error("Practicing certificate generation failed:", err);
      setToast({
        kind: "error",
        text:
          "Failed to generate certificate: " +
          (err?.message || "Unknown error"),
      });
    } finally {
      setBusyKey(null);
    }
  };

  if (!auth?.user && !auth?.loading) return null;

  const renderCard = (cert: (typeof resolvedCerts)[number]) => {
    const approvedVal = approval?.[cert.approvalCol] ?? null;
    const generatedVal = approval?.[cert.generatedCol] ?? null;
    const approved = isApproved(approvedVal);
    const alreadyGenerated = isApproved(generatedVal);

    let buttonContent: React.ReactNode;
    let buttonClass =
      "mt-auto font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors";
    let buttonAction: (() => void) | undefined = undefined;
    let disabled = false;
    let statusLabel = "";
    let statusColor = "";

    if (!approval) {
      statusLabel = "No approval record";
      statusColor = "text-gray-500";
      buttonContent = (
        <>
          <Lock className="w-5 h-5" /> Not Available
        </>
      );
      buttonClass += " bg-gray-400 text-white cursor-not-allowed";
      disabled = true;
    } else if (!approved) {
      statusLabel = "Not Eligible";
      statusColor = "text-gray-500";
      buttonContent = (
        <>
          <Lock className="w-5 h-5" /> Not Eligible
        </>
      );
      buttonClass += " bg-gray-400 text-white cursor-not-allowed";
      disabled = true;
    } else if (alreadyGenerated) {
      statusLabel = "Already Generated";
      statusColor = "text-emerald-700";
      buttonContent = (
        <>
          <CheckCircle2 className="w-5 h-5" /> View Certificate
        </>
      );
      buttonClass += " bg-emerald-600 hover:bg-emerald-700 text-white";
      buttonAction =
        cert.key === "practicing"
          ? () => {
              void (async () => {
                try {
                  setBusyKey("practicing");
                  await downloadStoredPracticingCertificate();
                } catch (err: any) {
                  setToast({
                    kind: "error",
                    text:
                      "Could not open stored certificate: " +
                      (err?.message || "Unknown error"),
                  });
                } finally {
                  setBusyKey(null);
                }
              })();
            }
          : undefined;
      disabled = false;
    } else if (!cert.hasGenerator) {
      statusLabel = "Approved – Coming Soon";
      statusColor = "text-amber-700";
      buttonContent = (
        <>
          <FileText className="w-5 h-5" /> Coming Soon
        </>
      );
      buttonClass += " bg-gray-400 text-white cursor-not-allowed";
      disabled = true;
    } else {
      statusLabel = "Approved – Ready to Generate";
      statusColor = "text-blue-700";
      const isBusy = busyKey === cert.key;
      buttonContent = isBusy ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" /> Generating…
        </>
      ) : (
        <>
          <Download className="w-5 h-5" /> Generate Certificate
        </>
      );
      buttonClass += isBusy
        ? " bg-blue-500 text-white cursor-wait"
        : " bg-blue-600 hover:bg-blue-700 text-white";
      buttonAction =
        cert.key === "practicing" ? generatePracticingCertificate : undefined;
      disabled = isBusy;
    }

    const handleClick = () => {
      if (disabled) return;
      buttonAction?.();
    };

    return (
      <div
        key={cert.key}
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-full"
      >
        <div className="h-48 bg-gradient-to-br from-white to-white flex items-center justify-center p-8">
          <Image
            src={cert.image}
            alt={`${cert.label} preview`}
            width={140}
            height={140}
            className="object-contain drop-shadow-md opacity-90"
          />
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
            {cert.label}
          </h3>

          <p className="text-center text-sm mb-4">
            Status: <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
          </p>

          <p className="text-center text-sm text-gray-500 mb-6 flex-1">
            {cert.note}
          </p>

          <button
            type="button"
            onClick={handleClick}
            disabled={disabled && !alreadyGenerated}
            className={buttonClass}
          >
            {buttonContent}
          </button>
        </div>
      </div>
    );
  };

  const renderIcpaSlotCard = (slot: IcpaCertificateSlot) => {
    const imageSrc = getPortalAssetPath(
      ICPA_SLOT_IMAGES[slot.key],
      isPremium
    );
    const approvalCol = icpaApprovalColumnForKey(slot.key);
    const approved = approval ? isApproved(approval[approvalCol]) : false;
    const hasFile = Boolean(slot.file);
    const canAccess = approved && hasFile;

    let statusLabel = "Not Eligible";
    let statusColor = "text-gray-500";
    if (!approval) {
      statusLabel = "No approval record";
    } else if (!approved) {
      statusLabel = "Not Eligible";
    } else if (!hasFile) {
      statusLabel = "Approved — awaiting upload";
      statusColor = "text-amber-700";
    } else {
      statusLabel = "Available";
      statusColor = "text-emerald-700";
    }

    return (
      <div
        key={slot.key}
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-full"
      >
        <div className="h-48 bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-8">
          <Image
            src={imageSrc}
            alt={`${slot.label} preview`}
            width={140}
            height={140}
            className="object-contain drop-shadow-md opacity-90"
          />
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
            {slot.label}
          </h3>

          <p className="text-center text-sm mb-4">
            Status:{" "}
            <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
          </p>

          <p className="text-center text-sm text-gray-500 mb-6 flex-1">
            {canAccess
              ? "Your certificate is ready to view or download."
              : !approved
                ? "This certificate must be approved by ICTPI before you can access it."
                : "Approved — the certificate file has not been uploaded yet."}
          </p>

          {canAccess && slot.file ? (
            <div className="mt-auto flex flex-col gap-2">
              <a
                href={slot.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-5 h-5" />
                View Certificate
              </a>
              <a
                href={slot.file.url}
                download={slot.file.download}
                className="font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="mt-auto font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm bg-gray-300 text-white cursor-not-allowed"
            >
              <Lock className="w-5 h-5" />
              {!approved ? "Not Eligible" : "Not Available"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderUploadedCertificatesSection = (
    title: string,
    description: string,
    certs: { title: string; storagePath: string; download: string; url: string }[],
    loadingSection: boolean,
    emptyMessage: string,
    gradientClass = "from-violet-50 to-indigo-100"
  ) => (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-6">{description}</p>

      {loadingSection ? (
        <div className="flex items-center gap-3 text-gray-600 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading certificates…
        </div>
      ) : certs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-600">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {certs.map((cert) => (
            <div
              key={cert.storagePath}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-full"
            >
              <div
                className={`h-48 bg-gradient-to-br ${gradientClass} flex items-center justify-center p-8`}
              >
                <FileText className="w-16 h-16 text-indigo-600 opacity-90" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center line-clamp-2">
                  {cert.title}
                </h3>
                <p className="text-center text-sm text-emerald-700 font-semibold mb-6">
                  Available
                </p>
                <div className="mt-auto flex flex-col gap-2">
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    View Certificate
                  </a>
                  <a
                    href={cert.url}
                    download={cert.download}
                    className="font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <AuthenticatedLayout title="Certificates" maxWidth="full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Certificates &amp; Marksheets
        </h1>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-600 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your certification status…
          </div>
        ) : errorMsg ? (
          <div className="flex items-start gap-3 text-red-800 bg-red-50 p-4 rounded-xl border border-red-200">
            <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{errorMsg}</p>
            </div>
          </div>
        ) : (
          <>
            {!isPremiumRoute && (
              <div className="mb-8 flex items-start gap-3 text-blue-900 bg-blue-50 p-4 rounded-xl border border-blue-200">
                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    Only certificates approved by ICTPI can be generated.
                  </p>
                  <p className="text-sm mt-1">
                    Each certificate can be generated only once. Please contact
                    support if you need a reissue.
                  </p>
                </div>
              </div>
            )}

            {isPremiumRoute ? (
              <>
                <div className="mb-8 flex items-start gap-3 text-violet-900 bg-violet-50 p-4 rounded-xl border border-violet-200">
                  <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      ICPA certificates require admin approval before download.
                    </p>
                    <p className="text-sm mt-1">
                      Skill India, Marksheet, and ICPA Certificate are loaded
                      from storage after approval is set in{" "}
                      <span className="font-mono">certification_approval</span>.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {(icpaLoading
                    ? ICPA_CERTIFICATE_TYPES.map((type) => ({
                        key: type.key,
                        label: type.label,
                        folder: type.folder,
                        file: null,
                      }))
                    : icpaSlots
                  ).map((slot) =>
                    icpaLoading ? (
                      <div
                        key={slot.key}
                        className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex items-center justify-center min-h-[320px]"
                      >
                        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      renderIcpaSlotCard(slot)
                    )
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                  {resolvedCerts.map((cert) => renderCard(cert))}
                </div>

                {renderUploadedCertificatesSection(
                  "Your Uploaded Certificates",
                  "Additional certificates uploaded for your membership (practicing, NCVET, Skill India, and more).",
                  commonCertificates,
                  commonLoading,
                  "No uploaded certificates have been found for your account yet.",
                  "from-sky-50 to-blue-100"
                )}
              </>
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] max-w-sm">
          <div
            className={`rounded-xl shadow-lg px-5 py-4 text-sm font-medium border ${
              toast.kind === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : toast.kind === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
