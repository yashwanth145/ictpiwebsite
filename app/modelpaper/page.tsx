"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Eye, Download, X, Radio, Circle,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { getPortalAssetPath } from "@/lib/portalTheme";
import { loadMemberProfileByMembershipId } from "@/lib/candidateExamSchedule";
import { getStoredMembershipId } from "@/lib/memberSession";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Session {
  sessionid: number;
  sessiontitle: string;
  sessiondate: string;
  sessiontime: string;
  sessionlink: string;
}

interface ModelPaper {
  title: string;
  src: string;
  downloadName: string;
}

export default function ModelPaperPage() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<ModelPaper | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveNow, setLiveNow] = useState(false);
  const [nearestFutureSession, setNearestFutureSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // User data from DB
  const [fullName, setFullName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("No email");
  const [loadingUser, setLoadingUser] = useState(true);

  const fullscreenRef = useRef<HTMLDivElement>(null);

  const modelPapers: ModelPaper[] = [
    { title: "MEPSC Model Question Paper 2025 - 01", src: "/pdf/modelpaper.pdf", downloadName: "MEPSC_Model_Paper_2025.pdf" },
    { title: "MEPSC Model Question Paper 2025 - 02", src: "/pdf/modelpaper2.pdf", downloadName: "MEPSC_Model_Paper_2025_2.pdf" },
    { title: "MCQ's of all subjects", src: "/pdf/MCQ.pdf", downloadName: "MCQ_all_subjects.pdf" },
  ];
  // Model papers are shared files stored once in the `notes` bucket, so they
  // resolve the same way for standard and premium members.
  const resolvedModelPapers = modelPapers.map((paper) => ({
    ...paper,
    src: getPortalAssetPath(paper.src, false),
  }));

  const isSessionLiveNow = (s: Session): boolean => {
    const now = toZonedTime(new Date(), "Asia/Kolkata");
    const sessionDT = toZonedTime(
      new Date(`${s.sessiondate}T${s.sessiontime}`),
      "Asia/Kolkata"
    );
    const start = toZonedTime(new Date(sessionDT.getTime() - 5 * 60 * 1000), "Asia/Kolkata");
    const end = toZonedTime(new Date(sessionDT.getTime() + 60 * 60 * 1000), "Asia/Kolkata");
    return now >= start && now <= end;
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!auth?.user) return;

    const currentEmail = auth.user.email?.toLowerCase()?.trim() || "";

    const fetchUserAndSessions = async () => {
      setLoadingUser(true);

      try {
        const { data: payload } = await loadMemberProfileByMembershipId(
          supabase,
          getStoredMembershipId()
        );

        const member = payload?.member;
        if (member) {
          const nameFromDb = member.name?.trim();
          setFullName(
            nameFromDb && nameFromDb.length > 0
              ? nameFromDb
              : currentEmail.split("@")[0] || "User"
          );
          setUserEmail((member.email ?? currentEmail).toLowerCase().trim());
        } else {
          setFullName(currentEmail.split("@")[0] || "User");
          setUserEmail(currentEmail);
        }

        // 2. Fetch sessions
        const { data, error } = await supabase.from("sessions").select("*");
        if (error) throw error;

        if (data) {
          const sorted = (data as Session[]).sort((a, b) =>
            new Date(`${a.sessiondate}T${a.sessiontime}`).getTime() -
            new Date(`${b.sessiondate}T${b.sessiontime}`).getTime()
          );
          setSessions(sorted);
          setLiveNow(sorted.some(isSessionLiveNow));

          const nowInIST = toZonedTime(new Date(), "Asia/Kolkata");
          const future = sorted.find(
            (s) => toZonedTime(new Date(`${s.sessiondate}T${s.sessiontime}`), "Asia/Kolkata") > nowInIST
          );
          setNearestFutureSession(future ?? null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndSessions();

    const interval = setInterval(() => {
      // Refetch sessions only (user info doesn't change often)
      supabase
        .from("sessions")
        .select("*")
        .then(({ data, error }) => {
          if (!error && data) {
            const sorted = (data as Session[]).sort((a, b) =>
              new Date(`${a.sessiondate}T${a.sessiontime}`).getTime() -
              new Date(`${b.sessiondate}T${b.sessiontime}`).getTime()
            );
            setSessions(sorted);
            setLiveNow(sorted.some(isSessionLiveNow));

            const nowInIST = toZonedTime(new Date(), "Asia/Kolkata");
            const future = sorted.find(
              (s) => toZonedTime(new Date(`${s.sessiondate}T${s.sessiontime}`), "Asia/Kolkata") > nowInIST
            );
            setNearestFutureSession(future ?? null);
          }
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [auth?.user]);

  useEffect(() => {
    if (!auth?.loading && !auth?.user && mounted) {
      router.push("/");
    }
  }, [auth, router, mounted]);

  const badgeSession = liveNow
    ? sessions.find(isSessionLiveNow) ?? null
    : nearestFutureSession;

  if (!mounted || !auth || auth.loading || loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  return (
    <>
      <style jsx>{`
        @layer utilities {
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to   { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        }
      `}</style>

      <AuthenticatedLayout
        title="Model Papers"
        headerActions={badgeSession ? (
          <button
            onClick={() => setSelectedSession(badgeSession)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-medium transition ${liveNow ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}`}
          >
            {liveNow ? (
              <>
                <Radio className="w-4 h-4" />
                <span className="hidden sm:inline">LIVE NOW</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">UPCOMING</span>
              </>
            )}
          </button>
        ) : null}
        maxWidth="md"
      >
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold">Model Question Papers</h2>
                  <p className="text-blue-100 mt-1">Download or view in fullscreen</p>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                  {resolvedModelPapers.map((paper, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{paper.title}</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => { setSelectedPaper(paper); setShowModal(true); }}
                          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                          <Eye className="w-5 h-5" /> View Full
                        </button>
                        <a
                          href={paper.src}
                          download={paper.downloadName}
                          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-md"
                        >
                          <Download className="w-5 h-5" /> Download PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

        {/* PDF Fullscreen Modal */}
        {showModal && selectedPaper && (
          <div ref={fullscreenRef} className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
            <div className="bg-gray-900 p-4 flex justify-between items-center text-white shadow-2xl">
              <h3 className="text-lg font-semibold truncate max-w-[55%]">{selectedPaper.title}</h3>
              <div className="flex items-center gap-4">
                <a
                  href={selectedPaper.src}
                  download={selectedPaper.downloadName}
                  className="bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download
                </a>
                <button
                  onClick={() => { setShowModal(false); setSelectedPaper(null); }}
                  className="bg-gray-700 hover:bg-gray-800 px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                >
                  <X className="w-5 h-5" /> Close
                </button>
              </div>
            </div>
            <iframe
              src={selectedPaper.src}
              className="flex-1 w-full border-0 bg-white"
              title={selectedPaper.title}
              allowFullScreen
            />
          </div>
        )}

        {/* Live Session Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
              <button
                onClick={() => setSelectedSession(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-xl">LIVE NOW</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Circle className="w-5 h-5 fill-current" />
                    <span className="font-bold text-xl">Upcoming Session</span>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedSession.sessiontitle}
              </h3>

              <div className="space-y-2 text-gray-700 mb-6">
                <p><strong>Date:</strong> {format(new Date(selectedSession.sessiondate), "dd MMM yyyy")}</p>
                <p><strong>Time:</strong> {format(new Date(`1970-01-01T${selectedSession.sessiontime}`), "hh:mm a")} IST</p>
              </div>

              <a
                href={selectedSession.sessionlink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0062cc] text-white font-medium py-3.5 rounded-xl hover:bg-blue-700 transition text-center block text-lg shadow-md"
              >
                Join Google Meet
              </a>
            </div>
          </div>
        )}
      </AuthenticatedLayout>
    </>
  );
}