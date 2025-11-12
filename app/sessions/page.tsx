"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  RefreshCw,
  ExternalLink,
  User2,
  Calendar,
  Clock,
  Link2,
  Lock,
  History,
  GraduationCap,
  ClipboardPenLine
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

/* ─────── Assets ─────── */
import logo from "../../assets/ICTPL_image.png";

/* ─────── NEW ─────── */
import emailNamePairs from "../../public/names.json";

/* ─────── Types ─────── */
interface Session {
  sessionid: number;
  sessiontitle: string;
  sessiondate: string;   // YYYY-MM-DD
  sessiontime: string;   // HH:MM[:SS]
  sessionlink: string;
  name_of_the_trainer?: string;  // Email of trainer
  day?: string;                  // Optional: "Monday", etc.
}

/* ─────── Supabase ─────── */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase env vars! Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ─────── Email to Name Map ─────── */
const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(([email, name]) => {
  emailToName.set(email.toLowerCase(), name);
});

/* ─────── Helper – format time ─────── */
const formatTime = (time: string): string => {
  const parts = time.split(":");
  if (parts.length === 2) parts.push("00");
  return parts.map(p => p.padStart(2, "0")).join(":");
};

/* ─────── Helper – custom capitalize trainer name ─────── */
const capitalizeTrainerName = (name: string): string => {
  return name
    .split(" ")
    .map(word => {
      if (word.toLowerCase() === "ctpr") {
        return "CTPr"; // Keep 'r' lowercase, rest uppercase
      }
      return word.toUpperCase();
    })
    .join(" ");
};

/* ─────── Dashboard ─────── */
export default function Dashboard() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) router.replace("/");
  }, [auth, router]);

  /* ---------- Fetch (with manual refresh) ---------- */
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("sessiondate", { ascending: true })
      .order("sessiontime", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      setSessions([]);
    } else {
      setSessions((data as Session[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!auth?.user) return;
    fetchSessions();
    const id = setInterval(fetchSessions, 30_000);
    return () => clearInterval(id);
  }, [auth?.user, fetchSessions]);

  const signOut = async () => {
    try {
      await auth?.signOut?.();
      router.replace("/");
    } catch (e) {
      console.error(e);
    }
  };

  /* ---------- Get Full Name from Email ---------- */
  const getUserDisplayName = () => {
    const userEmail = auth.user?.email?.toLowerCase();
    if (userEmail && emailToName.has(userEmail)) {
      return emailToName.get(userEmail)!;
    }
    return auth.user?.email?.split("@")[0] || "User";
  };

  if (!auth || auth.loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-blue-600">Loading…</p>
      </div>
    );
  if (!auth.user) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        {/* ─────── Desktop Sidebar (Minimal) ─────── */}
        <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-[#0062cc] text-white flex-col shadow-xl">
          <nav className="flex-1 px-4 py-8 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-700 text-white font-medium"
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <Link
              href="/results"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <ClipboardList className="w-5 h-5" /> Results
            </Link>
            <Link
              href="/sessions"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <ClipboardList className="w-5 h-5" /> Sessions
            </Link>
            <Link
              href="/previous"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <History className="w-5 h-5" /> Previous Sessions
            </Link>
            <Link
              href="/vlogs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <ClipboardList className="w-5 h-5" /> B/Vlogs
            </Link>
            <Link
              href="/schedule"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <GraduationCap className="w-5 h-5" /> Exam schedule
            </Link>
            <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
          </nav>
        </aside>

        {/* ─────── Mobile Bottom Nav ─────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-50 shadow-lg">
          <Link href="/dashboard" className="flex flex-col items-center text-xs text-blue-600">
            <LayoutDashboard className="w-6 h-6" />
            <span className="mt-1">Dashboard</span>
          </Link>
          <Link href="/results" className="flex flex-col items-center text-xs text-gray-600">
            <ClipboardList className="w-6 h-6" />
            <span className="mt-1">Results</span>
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-xs text-gray-600">
            <ClipboardList className="w-6 h-6" />
            <span className="mt-1">Sessions</span>
          </Link>
          <Link href="/previous" className="flex flex-col items-center text-xs text-gray-600">
            <ClipboardList className="w-6 h-6" />
            <span className="mt-1">Previous sessions</span>
          </Link>
          <Link
              href="/vlogs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <ClipboardList className="w-5 h-5" /> B/Vlogs
            </Link>
            <Link
              href="/schedule"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <GraduationCap className="w-5 h-5" /> Exam schedule
            </Link>
            <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
          <button onClick={signOut} className="flex flex-col items-center text-xs text-red-600">
            <LogOut className="w-6 h-6" />
            <span className="mt-1">Logout</span>
          </button>
        </nav>

        {/* ─────── Main Content ─────── */}
        <div className="md:ml-60">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Image src={logo} alt="Logo" className="h-12 w-12" />
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Session</h1>
                  <p className="text-sm text-gray-500">
                    All upcoming and past sessions
                  </p>
                </div>
              </div>
              {/* Beautiful MEPSC Assessment Announcement */}
              <div className="relative group">
                <Link href="/schedule">
                  <div className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm md:text-base px-5 py-3 rounded-xl shadow-2xl transition-all transform hover:scale-105 hover:shadow-3xl cursor-pointer animate-pulse flex flex-col items-center leading-tight">
                    <span className="tracking-wider">MEPSC ASSESSMENT</span>
                    <span className="tracking-wider">STARTS FROM TOMORROW</span>
                    <span className="text-xs mt-1 opacity-90">Search your schedule from Exam Schedule</span>
                  </div>
                </Link>

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-4 whitespace-nowrap shadow-2xl">
                    Click to view Exam Schedule
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
                </div>
              </div>
              {/* Desktop User Info + Sign Out */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">
                    {getUserDisplayName()}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            {/* Refresh Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={fetchSessions}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0062cc] text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-md text-sm"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No sessions found.</p>
                <p className="text-sm text-gray-400 mt-1">Check back later or refresh.</p>
              </div>
            ) : (
              /* Sessions Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => {
                  // Derive day name from sessiondate
                  const dateObj = new Date(session.sessiondate);
                  const dayName = isNaN(dateObj.getTime())
                    ? session.day || "Unknown Day"
                    : dateObj.toLocaleDateString("en-US", { weekday: "long" });

                  // Get trainer name
                  const trainerEmail = session.name_of_the_trainer?.toLowerCase();
                  const trainerName = trainerEmail && emailToName.has(trainerEmail)
                    ? capitalizeTrainerName(emailToName.get(trainerEmail)!)
                    : trainerEmail
                    ? capitalizeTrainerName(trainerEmail.split("@")[0])
                    : "Not Assigned";

                  return (
                    <div
                      key={session.sessionid}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 overflow-hidden flex flex-col"
                    >
                      <div className="p-6 flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                          {session.sessiontitle}
                        </h3>

                        <div className="space-y-3 text-sm text-gray-600">
                          {/* Trainer */}
                          <div className="flex items-center gap-2">
                            <User2 className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{trainerName}</span>
                          </div>

                          {/* Day of Week */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span>{dayName}</span>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{session.sessiondate}</span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{formatTime(session.sessiontime)}</span>
                          </div>

                          {/* Link */}
                          <div className="flex items-start gap-2">
                            <Link2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <a
                              href={session.sessionlink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all text-xs"
                            >
                              {session.sessionlink}
                            </a>
                          </div>

                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <span>password:ICTPI</span>
                          </div>

                        </div>
                      </div>

                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-500">
                          SESSION-ID: {session.sessionid}
                        </span>
                        <a
                          href={session.sessionlink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}