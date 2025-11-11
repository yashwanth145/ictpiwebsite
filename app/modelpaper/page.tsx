"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ClipboardList,
  User2,
  LogOut,
  Radio,
  Circle,
  History,
  GraduationCap,
  ClipboardPenLine,
  Eye,
  Download,
  X,
} from "lucide-react";
import logo from "../../assets/ICTPL_image.png";
import emailNamePairs from "../../public/names.json";
import { createClient } from "@supabase/supabase-js";
import { format, addMinutes, isWithinInterval } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email → Name Map
const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(
  ([email, name]) => emailToName.set(email.toLowerCase(), name)
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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveNow, setLiveNow] = useState(false);
  const [nearestFutureSession, setNearestFutureSession] = useState<Session | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ModelPaper | null>(null);

  // Multiple Model Papers
  const modelPapers: ModelPaper[] = [
    {
      title: "MEPSC Model Question Paper 2025 - 01",
      src: "/pdf/modelpaper.pdf",
      downloadName: "MEPSC_Model_Paper_2025.pdf",
    },
    {
      title: "MEPSC Model Question Paper 2025 - 02",
      src: "/pdf/modelpaper2.pdf",
      downloadName: "MEPSC_Model_Paper_2025_2.pdf",
    },
  ];

  // Live session logic
  const isSessionLiveNow = (s: Session): boolean => {
    const now = toZonedTime(new Date(), "Asia/Kolkata");
    const sessionDT = toZonedTime(
      new Date(`${s.sessiondate}T${s.sessiontime}`),
      "Asia/Kolkata"
    );
    const start = addMinutes(sessionDT, -5);
    const end = addMinutes(sessionDT, 60);
    return isWithinInterval(now, { start, end });
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase.from("sessions").select("*");
      if (data) {
        const sorted = (data as Session[]).sort(
          (a, b) =>
            new Date(`${a.sessiondate}T${a.sessiontime}`).getTime() -
            new Date(`${b.sessiondate}T${b.sessiontime}`).getTime()
        );
        setSessions(sorted);
        setLiveNow(sorted.some(isSessionLiveNow));
        const future = sorted.find(
          (s) => new Date(`${s.sessiondate}T${s.sessiontime}`) > new Date()
        );
        setNearestFutureSession(future ?? null);
      }
    };
    if (auth?.user) {
      fetchSessions();
      const id = setInterval(fetchSessions, 30_000);
      return () => clearInterval(id);
    }
  }, [auth?.user]);

  useEffect(() => {
    if (!auth || auth.loading || !mounted) return;
    if (!auth.user) router.push("/");
  }, [auth, router, mounted]);

  const handleSignOut = async () => {
    await auth.signOut?.();
    router.push("/");
  };

  const getUserDisplayName = () => {
    const email = auth.user?.email?.toLowerCase();
    return email && emailToName.has(email)
      ? emailToName.get(email)!
      : auth.user?.email?.split("@")[0] || "User";
  };

  const badgeSession = liveNow
    ? sessions.find(isSessionLiveNow) ?? null
    : nearestFutureSession;

  if (!mounted || !auth || auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-gray-600">Loading...</p>
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
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Desktop Sidebar - Sticky & Scrollable */}
        <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col h-screen sticky top-0 overflow-y-auto">
          

          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                pathname === "/dashboard" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            <Link
              href="/results"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                pathname === "/results" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
              }`}
            >
              <ClipboardList className="w-5 h-5 mr-3" /> Result
            </Link>
            <Link
              href="/sessions"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                pathname === "/sessions" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
              }`}
            >
              <ClipboardList className="w-5 h-5 mr-3" /> Sessions
            </Link>
            <Link
              href="/previous"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                pathname === "/previous" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
              }`}
            >
              <History className="w-5 h-5 mr-3" /> Previous Sessions
            </Link>
            <Link
              href="/vlogs"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                pathname === "/vlogs" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
              }`}
            >
              <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
            </Link>
            <Link
              href="/schedule"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                pathname === "/schedule" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
              }`}
            >
              <GraduationCap className="w-5 h-5 mr-3" /> Exam schedule
            </Link>
            <Link
              href="/modelpaper"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                pathname === "/modelpaper" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
              }`}
            >
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
          </nav>

          <div className="p-4 border-t border-blue-500">
            
          </div>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
          <Link href="/dashboard" className="flex flex-col items-center"><LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard</Link>
          <Link href="/results" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
          <Link href="/sessions" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
          <Link href="/previous" className="flex flex-col items-center"><History className="w-5 h-5 mb-1" /> Previous</Link>
          <Link href="/vlogs" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> B/Vlogs</Link>
          <Link href="/modelpaper" className="flex flex-col items-center"><ClipboardPenLine className="w-5 h-5 mb-1" /> Model</Link>
          <button onClick={handleSignOut} className="flex flex-col items-center"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
            <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
            <div className="flex items-center gap-3 md:gap-5">
              {badgeSession && (
                <button
                  onClick={() => setSelectedSession(badgeSession)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium transition ${
                    liveNow ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {liveNow ? (
                    <>
                      <Radio className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">LIVE NOW</span>
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="absolute inline-flex h-6 w-6 rounded-full bg-green-400 opacity-75 animate-ping"></span>
                        <span className="absolute inline-flex h-5 w-5 rounded-full bg-green-500 opacity-75 animate-ping delay-150"></span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 fill-current text-white" />
                      <span className="hidden sm:inline">UPCOMING</span>
                    </>
                  )}
                </button>
              )}

              {/* MEPSC Assessment Announcement */}
              <div className="relative group">
                <Link href="/schedule">
                  <div className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm md:text-base px-5 py-3 rounded-xl shadow-2xl transition-all transform hover:scale-105 hover:shadow-3xl cursor-pointer animate-pulse flex flex-col items-center leading-tight">
                    <span className="tracking-wider">MEPSC ASSESSMENT</span>
                    <span className="tracking-wider">STARTS FROM TOMORROW</span>
                    <span className="text-xs mt-1 opacity-90">Search your schedule from Exam Schedule</span>
                  </div>
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-4 whitespace-nowrap shadow-2xl">
                    Click to view Exam Schedule
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-gray-700" />
                <div className="text-sm text-gray-800 text-right">
                  <div className="font-semibold truncate max-w-[150px] md:max-w-none">
                    {getUserDisplayName()}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8 bg-gray-100 mb-[80px] md:mb-0">
            {/* Model Papers Grid */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold">Model Question Papers</h2>
                  <p className="text-blue-100 mt-1">Download or view in fullscreen</p>
                </div>

                <div className="p-8 space-y-6">
                  {modelPapers.map((paper, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        {paper.title}
                      </h3>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => {
                            setSelectedPaper(paper);
                            setShowModal(true);
                          }}
                          className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                          <Eye className="w-5 h-5" />
                          View Fullscreen
                        </button>

                        <a
                          href={paper.src}
                          download={paper.downloadName}
                          className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-md"
                        >
                          <Download className="w-5 h-5" />
                          Download PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Fullscreen PDF Modal */}
        {showModal && selectedPaper && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col">
            <div className="bg-gray-800 p-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-semibold truncate max-w-[70%]">
                {selectedPaper.title}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={selectedPaper.src}
                  download={selectedPaper.downloadName}
                  className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPaper(null);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <iframe
              src={selectedPaper.src}
              className="flex-1 w-full border-0"
              title={selectedPaper.title}
              allowFullScreen
            />
          </div>
        )}

        {/* Live Session Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
              <button onClick={() => setSelectedSession(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-lg">LIVE NOW</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <Circle className="w-5 h-5 fill-current" />
                    <span className="font-bold text-lg">Upcoming Session</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{selectedSession.sessiontitle}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-5">
                <p><strong>Date:</strong> {format(new Date(selectedSession.sessiondate), "dd MMM yyyy")}</p>
                <p><strong>Time:</strong> {format(new Date(`1970-01-01T${selectedSession.sessiontime}`), "hh:mm a")}</p>
              </div>
              <a
                href={selectedSession.sessionlink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0062cc] text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition text-center block"
              >
                Join Google Meet
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}