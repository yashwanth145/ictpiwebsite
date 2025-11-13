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
  Clock,
  History,
  GraduationCap,
  ClipboardPenLine,
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

import emailNamePairs from "../../public/names.json";

interface Session {
  sessionid: number;
  sessiontitle: string;
  sessiondate: string;
  sessiontime: string;
  sessionlink: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase env vars! Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(
  ([email, name]) => {
    emailToName.set(email.toLowerCase(), name);
  }
);

export default function Dashboard() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [liveNow, setLiveNow] = useState(false);
  const [nearestFutureSession, setNearestFutureSession] =
    useState<Session | null>(null);

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

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase.from("sessions").select("*");
      if (error) {
        console.error("Supabase error:", error);
        return;
      }
      if (!data || data.length === 0) {
        setSessions([]);
        return;
      }

      const sorted = (data as Session[]).sort((a, b) => {
        const da = new Date(`${a.sessiondate}T${a.sessiontime}`).getTime();
        const db = new Date(`${b.sessiondate}T${b.sessiontime}`).getTime();
        return da - db;
      });

      setSessions(sorted);
      const anyLive = sorted.some(isSessionLiveNow);
      setLiveNow(anyLive);

      const now = new Date();
      const future = sorted.find(
        (s) => new Date(`${s.sessiondate}T${s.sessiontime}`) > now
      );
      setNearestFutureSession(future ?? null);
    };

    if (auth?.user) {
      fetchSessions();
      const id = setInterval(fetchSessions, 30_000);
      return () => clearInterval(id);
    }
  }, [auth?.user]);

  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) router.push("/");
  }, [auth, router]);

  if (!auth || auth.loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!auth.user) return null;

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

  const courses = [
    { title: "Indirect Tax Laws Compliance (ITXL)", route: "indirecttax", image: accountancy },
    { title: "Business Regulatory Laws Compliance", route: "business", image: complaince },
    { title: "Direct Tax Laws Compliance (DTLC)", route: "directtax", image: directax },
    { title: "Applied Financial Accounting & Ethics", route: "appliedfinance", image: appliedfinance },
  ];

  const liveSessions = sessions.filter(isSessionLiveNow);
  const badgeSession = liveNow ? liveSessions[0] ?? null : nearestFutureSession;

  const getUserDisplayName = () => {
    const userEmail = auth.user?.email?.toLowerCase();
    if (userEmail && emailToName.has(userEmail)) {
      return emailToName.get(userEmail)!;
    }
    return auth.user?.email?.split("@")[0] || "User";
  };

  const fullName = getUserDisplayName().trim();
  const hasSpace = fullName.includes(" ");
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <>
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
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
            <Link href="/previous" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <History className="w-5 h-5 mr-3" /> Previous Sessions
            </Link>
            <Link href="/vlogs" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
            </Link>
            <Link href="/schedule" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <GraduationCap className="w-5 h-5 mr-3" /> Exam schedule
            </Link>
            <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50">
          <Link href="/dashboard" className="flex flex-col items-center text-xs"><LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard</Link>
          <Link href="/results" className="flex flex-col items-center text-xs"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
          <Link href="/sessions" className="flex flex-col items-center text-xs"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
          <Link href="/previous" className="flex flex-col items-center text-xs"><History className="w-5 h-5 mb-1" /> Previous</Link>
          <Link href="/vlogs" className="flex flex-col items-center text-xs"><ClipboardList className="w-5 h-5 mb-1" /> B/Vlogs</Link>
          <Link href="/schedule" className="flex flex-col items-center text-xs"><GraduationCap className="w-5 h-5 mb-1" /> Schedule</Link>
          <Link href="/modelpaper" className="flex flex-col items-center text-xs"><ClipboardPenLine className="w-5 h-5 mb-1" /> Papers</Link>
          <button onClick={handleSignOut} className="flex flex-col items-center text-xs"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow px-4 md:px-6 py-4 sticky top-0 z-40 gap-4">
            {/* Left: Logo + Announcements */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />

              <div className="flex flex-col sm:flex-row gap-3 text-sm w-full">
                {/* MEPSC ASSESSMENT */}
                <div className="relative group flex-shrink-0">
                  <Link href="/schedule">
                    <div className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer text-center text-xs leading-tight">
                      <div className="tracking-wider">MEPSC ASSESSMENT</div>
                      <div className="text-[11px]">STARTS FROM TOMORROW</div>
                      <div className="text-[10px] opacity-90">Check Exam Schedule</div>
                    </div>
                  </Link>
                </div>

                {/* ZOOM VIVA SCHEDULE - FIXED FOR MOBILE */}
                <div className="relative group flex-1 min-w-0">
                  <Link href="/schedule">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-3 py-3 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer">
                      <div className="text-xs font-extrabold tracking-wider mb-2">ZOOM VIVA</div>
                      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory">
                        {/* Batch 1 */}
                        <div className="bg-white/25 backdrop-blur-sm rounded-lg p-2 min-w-[165px] snap-center border border-white/40 flex-shrink-0">
                          <div className="text-[10px] opacity-90 leading-tight">CTPr RPL Batch 7</div>
                                                    <div className="text-[10px] opacity-90 leading-tight">Date-OCT/2025</div>
                          <div className="font-bold text-xs mt-0.5">ID: 3563357</div>
                          <div className="text-[10px] mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />9:00AM - 10:00AM</div>
                        </div>
                        {/* Batch 2 */}
                        <div className="bg-white/25 backdrop-blur-sm rounded-lg p-3 min-w-[165px] snap-center border border-white/40 flex-shrink-0">
                          <div className="text-[10px] opacity-90 leading-tight">CTPr RPL Batch 8 (OCT/2025)</div>
                          <div className="font-bold text-xs mt-0.5">ID: 3563449</div>
                          <div className="text-[10px] mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />3:00PM - 4:30PM</div>
                        </div>
                        {/* Batch 3 */}
                        <div className="bg-white/25 backdrop-blur-sm rounded-lg p-2 min-w-[165px] snap-center border border-white/40 flex-shrink-0">
                          <div className="text-[10px] opacity-90 leading-tight">CTPr RPL Batch 9(OCT/2025)</div>
                          <div className="font-bold text-xs mt-0.5">ID:3563728</div>
                          <div className="text-[10px] mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />6:00PM - 7:30PM</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side: Badge + Name + Sign Out */}
            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              {/* Live Badge */}
              {badgeSession && (
                <button
                  onClick={() => openModal(badgeSession)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium transition whitespace-nowrap
                    ${liveNow ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
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
              )}

              {/* Name + User Icon */}
              <div className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-gray-700 flex-shrink-0" />

                {hasSpace ? (
                  <div className="text-sm text-gray-800 font-semibold leading-none text-center">
                    <div>{firstName}</div>
                    {lastName && <div className="text-sm opacity-90">{lastName}</div>}
                  </div>
                ) : (
                  <div className="text-sm text-gray-800 font-semibold truncate" title={fullName}>
                    {fullName}
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm whitespace-nowrap"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </header>

          {/* Course Cards */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto mb-[80px] md:mb-0 bg-gray-100">
            {courses.map((c, i) => (
              <div
                key={i}
                onClick={() => router.push(`/courses/${c.route}`)}
                className="bg-white shadow-md rounded-xl p-4 hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
              >
                <Image src={c.image} alt={c.title} className="w-full h-40 object-cover rounded-md mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 text-center">{c.title}</h3>
              </div>
            ))}
          </main>
        </div>

        {/* Session Modal */}
        {showModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
              <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-2 mb-3">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Radio className="w-5 h-5" />
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