"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Eye, X, Radio, Circle, AlertTriangle, LogOut,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
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

interface HtmlTest {
  title: string;
  src: string;
}

export default function MockTestsPage() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedHtmlTest, setSelectedHtmlTest] = useState<HtmlTest | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [unfairExit, setUnfairExit] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveNow, setLiveNow] = useState(false);
  const [nearestFutureSession, setNearestFutureSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // User name from Supabase
  const [fullName, setFullName] = useState<string>("User");
  const [loadingUser, setLoadingUser] = useState(true);

  const fullscreenRef = useRef<HTMLDivElement>(null);

  const htmlTests: HtmlTest[] = [
    { title: "01.1 INDIRECT TAXES GST", src: "/tests/01.1_INDIRECT_TAXES_GST.html" },
    { title: "01.2 INDIRECT CUSTOMS", src: "/tests/01.2_INDIRECT_CUSTOMS.html" },
    { title: "02.1 Advising on Setup up a Business", src: "/tests/02.1_Advising_on_Setup_up_a_Business.html" },
    { title: "02.2 Appendix", src: "/tests/02.2_Appendix.html" },
    { title: "02.3 Business Maintenance", src: "/tests/02.3_Business_Maintenance.html" },
    { title: "02.4 Close Business", src: "/tests/02.4_Close_Business.html" },
    { title: "4.1 Income_Tax_Combined_Quiz_v1", src: "/tests/4.1_Income_Tax_Combined_Quiz_v1.html" },
    { title: "4.2 Advanced_Taxation_Combined_Quiz_v1", src: "/tests/4.2_Advanced_Taxation_Combined_Quiz_v1.html" },
    { title: "4.3 Corporate_Taxation_Combined_Quiz_v1", src: "/tests/4.3_Corporate_Taxation_Combined_Quiz_v1.html" },
    { title: "4.4 Special_Taxation_Combined_Quiz", src: "/tests/4.4_Special_Taxation_Combined_Quiz.html" },
    { title: "4.5 Tax_Assessment_and_Special_Topics_Combined_Quiz", src: "/tests/4.5_Tax_Assessment_and_Special_Topics_Combined_Quiz.html" },
  ];
  const resolvedHtmlTests = htmlTests;

  const startFullscreenTest = (test: HtmlTest) => {
    setSelectedHtmlTest(test);
    setShowModal(true);
    setIsTestActive(true);
    setUnfairExit(false);
    setTimeout(() => {
      fullscreenRef.current?.requestFullscreen?.() ||
      (fullscreenRef.current as any)?.webkitRequestFullscreen?.() ||
      (fullscreenRef.current as any)?.msRequestFullscreen?.();
    }, 100);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (isTestActive && !document.fullscreenElement) {
        setUnfairExit(true);
        setIsTestActive(false);
      }
    };
    const events = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"];
    events.forEach(e => document.addEventListener(e, handleFullscreenChange));
    return () => events.forEach(e => document.removeEventListener(e, handleFullscreenChange));
  }, [isTestActive]);

  const handleCleanExit = () => {
    document.exitFullscreen?.();
    setShowModal(false);
    setSelectedHtmlTest(null);
    setIsTestActive(false);
    setUnfairExit(false);
  };

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === "TEST_SUBMITTED" && isTestActive) {
        handleCleanExit();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [isTestActive]);

  const isSessionLiveNow = (s: Session): boolean => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowInIST = new Date(now.getTime() + istOffset);
    const sessionDateTime = new Date(`${s.sessiondate}T${s.sessiontime}`);
    const start = new Date(sessionDateTime.getTime() - 5 * 60 * 1000);
    const end = new Date(sessionDateTime.getTime() + 60 * 60 * 1000);
    return nowInIST >= start && nowInIST <= end;
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!auth?.user?.email) return;

    const currentEmail = auth.user.email.toLowerCase().trim();

    const fetchUserAndSessions = async () => {
      setLoadingUser(true);

      try {
        const { data: payload } = await loadMemberProfileByMembershipId(
          supabase,
          getStoredMembershipId()
        );

        const nameFromDb = payload?.member?.name?.trim();
        setFullName(
          nameFromDb && nameFromDb.length > 0
            ? nameFromDb
            : currentEmail.split("@")[0] || "User"
        );

        // Fetch sessions
        const { data } = await supabase.from("sessions").select("*");
        if (data) {
          const sorted = (data as Session[]).sort((a, b) =>
            new Date(`${a.sessiondate}T${a.sessiontime}`).getTime() -
            new Date(`${b.sessiondate}T${b.sessiontime}`).getTime()
          );
          setSessions(sorted);
          setLiveNow(sorted.some(isSessionLiveNow));
          const nowInIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
          const future = sorted.find(s => new Date(`${s.sessiondate}T${s.sessiontime}`) > nowInIST);
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
      supabase.from("sessions").select("*").then(({ data }) => {
        if (data) {
          const sorted = (data as Session[]).sort((a, b) =>
            new Date(`${a.sessiondate}T${a.sessiontime}`).getTime() -
            new Date(`${b.sessiondate}T${b.sessiontime}`).getTime()
          );
          setSessions(sorted);
          setLiveNow(sorted.some(isSessionLiveNow));
          const nowInIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
          const future = sorted.find(s => new Date(`${s.sessiondate}T${s.sessiontime}`) > nowInIST);
          setNearestFutureSession(future ?? null);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [auth?.user?.email]);

  useEffect(() => {
    if (!auth || auth.loading || !mounted) return;
    if (!auth.user) router.push("/");
  }, [auth, router, mounted]);

  const badgeSession = liveNow ? sessions.find(isSessionLiveNow) ?? null : nearestFutureSession;

  if (!mounted || !auth || auth.loading || loadingUser) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  }
  if (!auth.user) return null;

  const liveBadge = badgeSession ? (
    <button
      onClick={() => setSelectedSession(badgeSession)}
      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium transition ${liveNow ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
    >
      {liveNow ? (
        <>
          <Radio className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">LIVE NOW</span>
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute inline-flex h-6 w-6 rounded-full bg-green-400 opacity-75 animate-ping" />
          </span>
        </>
      ) : (
        <>
          <Circle className="w-3.5 h-3.5 fill-current text-white" />
          <span className="hidden sm:inline">UPCOMING</span>
        </>
      )}
    </button>
  ) : null;

  return (
    <>
      <style jsx>{`
        @layer utilities {
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        }
      `}</style>
      <AuthenticatedLayout title="Practice Tests" headerActions={liveBadge} maxWidth="md">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold">Interactive Practice Tests</h2>
                  <p className="text-purple-100 mt-1">Practice online with real exam interface</p>
                </div>
                <div className="p-8 space-y-6">
                  {resolvedHtmlTests.map((test, i) => (
                    <div key={i} className="border border-purple-200 bg-purple-50 rounded-lg p-6 hover:shadow-xl transition">
                      <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">TEST</span>
                        {test.title}
                      </h3>
                      <button
                        onClick={() => startFullscreenTest(test)}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg text-lg"
                      >
                        <Eye className="w-6 h-6" />
                        Start Test Fullscreen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

        {/* Test Fullscreen Modal */}
        {showModal && selectedHtmlTest && (
          <div ref={fullscreenRef} className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
            <div className="bg-gray-900 p-4 flex justify-between items-center text-white shadow-2xl">
              <h3 className="text-lg font-semibold truncate max-w-[60%]">{selectedHtmlTest.title}</h3>
              <button onClick={handleCleanExit} className="bg-red-600 hover:bg-red-700 px-7 py-3 rounded-lg font-bold text-white transition shadow-lg flex items-center gap-2 text-lg">
                <LogOut className="w-5 h-5" />
                Exit Test
              </button>
            </div>
            <iframe
              src={selectedHtmlTest.src}
              className="flex-1 w-full border-0 bg-white"
              title={selectedHtmlTest.title}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-forms allow-top-navigation-by-user-activation"
            />
          </div>
        )}

        {/* Unfair Exit Warning */}
        {unfairExit && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fadeIn">
              <AlertTriangle className="w-20 h-20 text-red-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-red-700 mb-3">Unfair Practice Detected!</h2>
              <p className="text-gray-700 text-lg mb-6">
                You exited fullscreen mode using ESC or F11.<br />
                This is not allowed in real exams.
              </p>
              <button
                onClick={() => {
                  setUnfairExit(false);
                  setShowModal(false);
                  setSelectedHtmlTest(null);
                  setIsTestActive(false);
                }}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                Return to Tests
              </button>
            </div>
          </div>
        )}

        {/* Live Session Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
              <button onClick={() => setSelectedSession(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
              <div className="flex items-center gap-2 mb-3">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600"><Radio className="w-5 h-5 animate-pulse" /><span className="font-bold text-lg">LIVE NOW</span></div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600"><Circle className="w-5 h-5 fill-current" /><span className="font-bold text-lg">Upcoming Session</span></div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{selectedSession.sessiontitle}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-5">
                <p><strong>Date:</strong> {format(new Date(selectedSession.sessiondate), "dd MMM yyyy")}</p>
                <p><strong>Time:</strong> {format(new Date(`1970-01-01T${selectedSession.sessiontime}`), "hh:mm a")}</p>
              </div>
              <a href={selectedSession.sessionlink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#0062cc] text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition text-center block">
                Join Google Meet
              </a>
            </div>
          </div>
        )}
      </AuthenticatedLayout>
    </>
  );
}