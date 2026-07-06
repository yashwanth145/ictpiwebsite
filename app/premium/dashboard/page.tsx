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
  History,
  ClipboardPenLine,
  FileCheck,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { AppLogo } from "@/components/AppLogo";
import { PremiumModeButton } from "@/components/PremiumModeButton";
import { EnquiryRemarksNotices } from "@/components/EnquiryRemarksNotices";
import { IcpaMaterialsNotice } from "@/components/IcpaMaterialsNotice";
import {
  loadMemberProfileByMembershipId,
  membershipIdLookupValues,
} from "@/lib/candidateExamSchedule";
import {
  getStoredMembershipId,
  getStoredMemberEmail,
  getStoredMemberName,
} from "@/lib/memberSession";

// Assets
import accountancy from "../../../assets/Accountancy.webp";
import complaince from "../../../assets/complaiance.webp";
import directax from "../../../assets/directtax.webp";
import appliedfinance from "../../../assets/fourthimage.webp";

// Date utilities
import { format, addMinutes, isWithinInterval } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase env vars! Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Session {
  sessionid: number;
  sessiontitle: string;
  sessiondate: string;
  sessiontime: string;
  sessionlink: string;
}

export default function Dashboard() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [liveNow, setLiveNow] = useState(false);
  const [nearestFutureSession, setNearestFutureSession] = useState<Session | null>(null);

  // User data from DB
  const [fullName, setFullName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("No email");
  const [membershipId, setMembershipId] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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
    if (!auth?.user) return;

    const firebaseEmail = auth.user.email?.toLowerCase()?.trim() || "";
    const currentUserEmail =
      getStoredMemberEmail()?.toLowerCase().trim() || firebaseEmail;

    const fetchUserAndSessions = async () => {
      setLoadingUser(true);

      try {
        const { data: memberPayload, error: memberLoadError } =
          await loadMemberProfileByMembershipId(
            supabase,
            getStoredMembershipId()
          );

        if (memberLoadError && !memberPayload?.member) {
          console.warn("Member profile:", memberLoadError);
        }

        const member = memberPayload?.member;
        if (member?.membership_id != null) {
          const ids = membershipIdLookupValues(member.membership_id);
          const mid = ids[0];
          if (mid != null) setMembershipId(mid);
          setUserEmail(
            (member.email ?? currentUserEmail).toLowerCase().trim()
          );

          const nameFromDb =
            member.name?.trim() || getStoredMemberName()?.trim();
          setFullName(
            nameFromDb && nameFromDb.length > 0
              ? nameFromDb
              : currentUserEmail.split("@")[0] || "User"
          );
        } else {
          console.warn(`No member record found for email: ${currentUserEmail}`);
          setFullName(currentUserEmail.split("@")[0] || "User");
          setUserEmail(currentUserEmail);
        }

        // 2. Fetch sessions
        const { data, error } = await supabase.from("sessions").select("*");
        if (error) {
          console.error("Supabase sessions error:", error);
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
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndSessions();

    const interval = setInterval(() => {
      // Only refetch sessions periodically, not user info
      supabase
        .from("sessions")
        .select("*")
        .then(({ data, error }) => {
          if (!error && data) {
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
          }
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [auth?.user]);

  useEffect(() => {
    if (!auth?.loading && !auth?.user) {
      router.push("/");
    }
  }, [auth, router]);

  if (!auth || auth.loading || loadingUser) {
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  }

  if (!auth.user) return null;

  const handleSignOut = async () => {
    try {
      await auth.signOut?.();
      await supabase.auth.signOut();
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

  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const hasSpace = nameParts.length > 1;

  const liveSessions = sessions.filter(isSessionLiveNow);
  const badgeSession = liveNow ? liveSessions[0] ?? null : nearestFutureSession;

  const courses = [
    { title: "Indirect Tax Laws Compliance (ITLC)", route: "indirecttax", image: accountancy },
    { title: "Business Regulatory Laws Compliance (BRLC)", route: "business", image: complaince },
    { title: "Direct Tax Laws Compliance (DTLC)", route: "directtax", image: directax },
    { title: "Applied Financial Accounting & Ethics (AFAE)", route: "appliedfinance", image: appliedfinance },
  ];

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
        <aside className="hidden md:sticky md:top-0 md:flex md:flex-col md:w-60 md:h-screen md:bg-purple-700 md:text-white md:overflow-y-auto scrollbar-hide">
          <nav className="flex-1 mt-4 space-y-3">
            <Link href="/premium" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            <Link href="/premium/sessions" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> Sessions
            </Link>
            <Link href="/previous" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <History className="w-5 h-5 mr-3" /> Previous Sessions
            </Link>
            <Link href="/premium/vlogs" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
            </Link>
            <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
            <Link href="/premium/tests" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Practice Tests
            </Link>
            <Link href="/premium/certificates" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <FileCheck className="w-5 h-5 mr-3" /> Certificates
            </Link>
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-purple-700/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50">
          <Link href="/premium" className="flex flex-col items-center text-xs">
            <LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard
          </Link>
          <Link href="/premium/sessions" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" /> Sessions
          </Link>
          <Link href="/previous" className="flex flex-col items-center text-xs">
            <History className="w-5 h-5 mb-1" /> Previous
          </Link>
          <Link href="/premium/vlogs" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" /> B/Vlogs
          </Link>
          <Link href="/modelpaper" className="flex flex-col items-center text-xs">
            <ClipboardPenLine className="w-5 h-5 mb-1" /> Papers
          </Link>
          <Link href="/premium/tests" className="flex flex-col items-center text-xs">
            <ClipboardPenLine className="w-5 h-5 mb-1" /> Tests
          </Link>
          <Link href="/premium/certificates" className="flex flex-col items-center text-xs">
            <FileCheck className="w-5 h-5 mb-1" /> Certs
          </Link>
          <button onClick={handleSignOut} className="flex flex-col items-center text-xs">
            <LogOut className="w-5 h-5 mb-1" /> Logout
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow px-4 md:px-6 py-4 sticky top-0 z-40 gap-4">
            <div className="flex items-center gap-4">
              <AppLogo variant="header" />
            </div>

            <div className="flex items-center gap-5 md:gap-8">
              <PremiumModeButton currentEmail={auth.user?.email} />
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center gap-3 hover:opacity-90 transition-all group"
                title="View profile"
              >
                <div className="bg-blue-50 text-blue-700 rounded-full p-2.5 group-hover:bg-blue-100 transition-colors">
                  <User2 className="w-6 h-6" />
                </div>

                <div className="text-left min-w-0">
                  {hasSpace ? (
                    <>
                      <div className="text-base font-semibold text-gray-800 leading-tight">
                        {firstName}
                      </div>
                      {lastName && <div className="text-sm text-gray-600">{lastName}</div>}
                    </>
                  ) : (
                    <div
                      className="text-base font-semibold text-gray-800 truncate max-w-[180px]"
                      title={fullName}
                    >
                      {fullName}
                    </div>
                  )}
                  
                </div>
              </button>

              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </header>

          {/* Live / Upcoming Badge */}
          {badgeSession && (
            <div className="px-4 md:px-8 pt-4">
              <button
                onClick={() => openModal(badgeSession)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition ${
                  liveNow ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {liveNow ? (
                  <>
                    <Radio className="w-5 h-5" />
                    LIVE NOW â€“ {badgeSession.sessiontitle}
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 fill-current" />
                    Upcoming: {badgeSession.sessiontitle}
                  </>
                )}
              </button>
            </div>
          )}

          {membershipId != null && (
            <EnquiryRemarksNotices
              membershipId={membershipId}
              className="px-4 md:px-8 pt-4"
            />
          )}

          <IcpaMaterialsNotice className="px-4 md:px-8 pt-3" />

          {/* Course Cards */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-24 md:pb-8 bg-gray-100">
            {courses.map((c, i) => (
              <div
                key={i}
                onClick={() => router.push(`/premium/courses/${c.route}`)}
                className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1 active:scale-98"
              >
                <Image
                  src={c.image}
                  alt={c.title}
                  className="w-full h-44 object-cover rounded-lg mb-4"
                  priority={i < 2}
                />
                <h3 className="text-lg font-semibold text-gray-800 text-center">
                  {c.title}
                </h3>
              </div>
            ))}
          </main>
        </div>

        {/* Session Join Modal */}
        {showModal && selectedSession && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-4">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Radio className="w-6 h-6" />
                    <span className="font-bold text-xl">LIVE NOW</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Circle className="w-6 h-6 fill-current" />
                    <span className="font-bold text-xl">Upcoming Session</span>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedSession.sessiontitle}
              </h3>

              <div className="space-y-3 text-gray-700 mb-6">
                <p>
                  <strong>Date:</strong>{" "}
                  {format(new Date(selectedSession.sessiondate), "dd MMM yyyy")}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {format(new Date(`1970-01-01T${selectedSession.sessiontime}`), "hh:mm a")} IST
                </p>
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
      </div>
    </>
  );
}
