"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  User2,
  LogOut,
  Radio,
  Circle,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

// Assets
import accountancy from "../../assets/Accountancy.webp";
import complaince from "../../assets/complaiance.webp";
import directax from "../../assets/directtax.webp";
import appliedfinance from "../../assets/fourthimage.webp";
import logo from "../../assets/ICTPL_image.png";

// Date utilities
import { format, addMinutes, isWithinInterval } from "date-fns";
import { toZonedTime } from "date-fns-tz";

/* -------------------------------------------------
   NEW: Email → Name JSON (email as key, name as value)
   ------------------------------------------------- */
import emailNamePairs from "../../public/names.json";

/* -------------------------------------------------
   Types – MATCH DB column names exactly
   ------------------------------------------------- */
interface Session {
  sessionid: number;
  sessiontitle: string;
  sessiondate: string;   // YYYY-MM-DD
  sessiontime: string;   // HH:MM:SS
  sessionlink: string;
}

/* -------------------------------------------------
   Supabase Client (Inline)
   ------------------------------------------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase env vars! Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* -------------------------------------------------
   Email → Name Map
   ------------------------------------------------- */
const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(([email, name]) => {
  emailToName.set(email.toLowerCase(), name);
});

/* -------------------------------------------------
   Dashboard Component
   ------------------------------------------------- */
export default function Dashboard() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [liveNow, setLiveNow] = useState(false);
  const [hasUpcoming, setHasUpcoming] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  /* ---------- Helper: is session live now? ---------- */
  const isSessionLiveNow = (s: Session): boolean => {
    const now = toZonedTime(new Date(), "Asia/Kolkata");
    const sessionDT = toZonedTime(
      new Date(`${s.sessiondate}T${s.sessiontime}`),
      "Asia/Kolkata"
    );
    const start = addMinutes(sessionDT, -5); // 5 min early
    const end = addMinutes(sessionDT, 60);   // 1 hour long
    return isWithinInterval(now, { start, end });
  };

  /* ---------- Fetch ALL sessions ---------- */
  useEffect(() => {
    const fetchSessions = async () => {
      console.log("Fetching sessions from Supabase...");

      const { data, error, status } = await supabase
        .from("sessions")
        .select("*");

      if (error) {
        console.error("Supabase error:", { message: error.message, status });
        return;
      }

      if (!data || data.length === 0) {
        console.log("No sessions returned.");
        setSessions([]);
        return;
      }

      console.log("Raw data from DB:", data);

      const sorted = (data as Session[]).sort((a, b) => {
        const da = new Date(`${a.sessiondate}T${a.sessiontime}`).getTime();
        const db = new Date(`${b.sessiondate}T${b.sessiontime}`).getTime();
        return da - db;
      });

      setSessions(sorted);

      const now = new Date();
      const hasLive = sorted.some(isSessionLiveNow);
      const hasFuture = sorted.some(
        (s) => new Date(`${s.sessiondate}T${s.sessiontime}`) > now
      );

      setLiveNow(hasLive);
      setHasUpcoming(hasFuture && !hasLive);
    };

    if (auth?.user) {
      fetchSessions();
      const id = setInterval(fetchSessions, 30_000);
      return () => clearInterval(id);
    }
  }, [auth?.user]);

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) router.push("/");
  }, [auth, router]);

  if (!auth || auth.loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!auth.user) return null;

  /* ---------- Handlers ---------- */
  const handleSignOut = async () => {
    try {
      await auth.signOut?.();
      router.push("/");
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  const openModal = (s: Session) => {
    setSelectedSession(s);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
  };

  const nearest = sessions[0] ?? null;

  /* ---------- Courses ---------- */
  const courses = [
    { title: "Indirect Tax Laws Compliance (ITXL)", route: "indirecttax", image: accountancy },
    { title: "Business Regulatory Laws Compliance", route: "business", image: complaince },
    { title: "Direct Tax Laws Compliance (DTLC)", route: "directtax", image: directax },
    { title: "Applied Financial Accounting & Ethics", route: "appliedfinance", image: appliedfinance },
  ];

  /* ---------- Live & Upcoming Filters ---------- */
  const liveSessions = sessions.filter(isSessionLiveNow);
  const upcomingSessions = sessions.filter(
    (s) =>
      new Date(`${s.sessiondate}T${s.sessiontime}`) > new Date() && !isSessionLiveNow(s)
  );

  /* ---------- Get Full Name from EMAIL (instead of member_id) ---------- */
  const getUserDisplayName = () => {
    const userEmail = auth.user?.email?.toLowerCase();
    if (userEmail && emailToName.has(userEmail)) {
      return emailToName.get(userEmail)!;
    }
    // Fallback – show the part before the @ (old behaviour)
    return auth.user?.email?.split("@")[0] || "User";
  };

  return (
    <>
      {/* Tailwind Animation + Delay Utility */}
      <style jsx>{`
        @layer utilities {
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          .delay-150 { animation-delay: 150ms; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col">
          <nav className="flex-1 mt-4 space-y-3">
            <Link href="/dashboard" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            <Link href="/results" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> Result
            </Link>
            <Link href="/sessions" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> Sessions
            </Link>
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50">
          <Link href="/dashboard" className="flex flex-col items-center text-xs">
            <LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard
          </Link>
          <Link href="/results" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" /> Results
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" />Sessions
          </Link>
          <button onClick={handleSignOut} className="flex flex-col items-center text-xs">
            <LogOut className="w-5 h-5 mb-1" /> Logout
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
            <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />

            <div className="flex items-center gap-3 md:gap-5">
              {/* Live / Upcoming Badge */}
              {(liveNow || hasUpcoming) && nearest && (
                <button
                  onClick={() => openModal(nearest)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium transition
                    ${liveNow
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-600 hover:bg-gray-700"
                    }`}
                >
                  {liveNow ? (
                    <>
                      <Radio className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">LIVE NOW</span>

                      {/* Outward Wave Effect */}
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="absolute inline-flex h-6 w-6 rounded-full bg-green-400 opacity-75 animate-ping"></span>
                        <span className="absolute inline-flex h-5 w-5 rounded-full bg-green-500 opacity-75 animate-ping delay-150"></span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      <span className="hidden sm:inline">Upcoming</span>
                    </>
                  )}
                </button>
              )}

              {/* User Info – FULL NAME FROM EMAIL */}
              <div className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-gray-700" />
                <div className="text-sm text-gray-800 text-right">
                  <div className="font-semibold truncate max-w-[150px] md:max-w-none">
                    {getUserDisplayName()}
                  </div>
                </div>
              </div>

              {/* Desktop Logout */}
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </header>

          {/* Course Cards */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 lg:gap-3 xl:gap-2 overflow-y-auto mb-[80px] md:mb-0 bg-gray-100">
            {courses.map((c, i) => (
              <div
                key={i}
                onClick={() => router.push(`/courses/${c.route}`)}
                className="bg-white shadow-md rounded-xl p-3 sm:p-4 lg:p-2 hover:shadow-lg transition cursor-pointer"
              >
                <Image src={c.image} alt={c.title} className="w-full h-36 sm:h-40 object-cover rounded-md mb-3" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{c.title}</h3>
              </div>
            ))}
          </main>
        </div>

        {/* All-Sessions Modal */}
        {showSessionsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 relative animate-fadeIn">
              <button
                onClick={() => setShowSessionsModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#0062cc]" />
                All Sessions
              </h2>

              {/* Live */}
              {liveSessions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <Radio className="w-5 h-5 animate-pulse" />
                    Live Now
                  </h3>
                  <div className="space-y-3">
                    {liveSessions.map((s) => (
                      <SessionCard key={s.sessionid} session={s} isLive />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming */}
              {upcomingSessions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Circle className="w-5 h-5 fill-gray-400 text-gray-400" />
                    Upcoming
                  </h3>
                  <div className="space-y-3">
                    {upcomingSessions.map((s) => (
                      <SessionCard key={s.sessionid} session={s} isLive={false} />
                    ))}
                  </div>
                </div>
              )}

              {liveSessions.length === 0 && upcomingSessions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No sessions scheduled.</p>
              )}
            </div>
          </div>
        )}

        {/* Nearest-Session Modal */}
        {showModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
              <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-2 mb-3">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-lg">LIVE NOW</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Circle className="w-5 h-5 fill-current" />
                    <span className="font-bold text-lg">Upcoming Session</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">{selectedSession.sessiontitle}</h3>

              <div className="space-y-2 text-sm text-gray-600 mb-5">
                <p>
                  <strong>Date:</strong>{" "}
                  {format(new Date(selectedSession.sessiondate), "dd MMM yyyy")}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {format(new Date(`1970-01-01T${selectedSession.sessiontime}`), "hh:mm a")}
                </p>
              </div>

              <a
                href={selectedSession.sessionlink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0062cc] text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition text-center block text-sm"
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

/* -------------------------------------------------
   Session Card (modal)
   ------------------------------------------------- */
function SessionCard({ session, isLive }: { session: Session; isLive: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#0062cc] transition">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800">{session.sessiontitle}</h4>
        {isLive && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        )}
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {format(new Date(session.sessiondate), "dd MMM yyyy")}
        </p>
        <p className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {format(new Date(`1970-01-01T${session.sessiontime}`), "hh:mm a")}
        </p>
      </div>
      <a
        href={session.sessionlink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0062cc] hover:underline"
      >
        Join Meet <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}