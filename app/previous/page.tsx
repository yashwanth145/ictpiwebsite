"use client";
import logo from "../../assets/ICTPL_image.png";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  History,
  User2,
  PlayCircle,
  GraduationCap,
  ClipboardPenLine
} from "lucide-react";
import Image from "next/image";

const PREVIOUS_SESSIONS = [
  {
    sessionid: 1,
    sessiontitle: "Applied Financial Accounting and Ethics 1",
    sessiondate: "2024-03-04",
    sessiontime: "14:30",
    sessionlink: "https://youtu.be/qtckGPd2gak?si=8CBdK9fa9nZE7PiY",
  },
  {
    sessionid: 2,
    sessiontitle: "Applied Financial Accounting and Ethics 2",
    sessiondate: "2024-03-05",
    sessiontime: "10:00",
    sessionlink: "https://www.youtube.com/watch?v=F0QVxLpWuIY&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=2",
  },
  {
    sessionid: 3,
    sessiontitle: "Business Regulatory Laws Compliance 1",
    sessiondate: "2024-05-06",
    sessiontime: "16:00",
    sessionlink: "https://www.youtube.com/watch?v=9u_dB4IGNeE&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=3",
  },
  {
    sessionid: 4,
    sessiontitle: "Business Regulatory Laws Compliance 2",
    sessiondate: "2024-06-07",
    sessiontime: "11:30",
    sessionlink: "https://www.youtube.com/watch?v=ltO2C0R96h8&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=4",
  },
  {
    sessionid: 5,
    sessiontitle: "Indirect Laws and Compliance 1",
    sessiondate: "2024-03-11",
    sessiontime: "15:00",
    sessionlink: "https://www.youtube.com/watch?v=R5jE6OdOcsE&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=5",
  },
  {
    sessionid: 6,
    sessiontitle: "Indirect Laws and Compliance 2",
    sessiondate: "2024-03-12",
    sessiontime: "10:00",
    sessionlink: "https://www.youtube.com/watch?v=Pyo3O0K8eoU&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=6",
  },
  {
    sessionid: 7,
    sessiontitle: "Indirect Tax Laws Compliance 3",
    sessiondate: "2024-03-13",
    sessiontime: "16:00",
    sessionlink: "https://www.youtube.com/watch?v=j2Jejo4XN2M&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=7",
  },
  {
    sessionid: 8,
    sessiontitle: "Direct Tax Laws Compliance 1",
    sessiondate: "2024-03-14",
    sessiontime: "11:30",
    sessionlink: "https://www.youtube.com/watch?v=QW5bYyI0CgY&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=8",
  },
  {
    sessionid: 9,
    sessiontitle: "Direct Tax Laws Compliance 2",
    sessiondate: "2024-03-15",
    sessiontime: "15:00",
    sessionlink: "https://www.youtube.com/watch?v=__aPdZ5pNpg&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=9",
  },
  {
    sessionid: 10,
    sessiontitle: "Overall Review of Session",
    sessiondate: "2024-03-16",
    sessiontime: "16:00",
    sessionlink: "https://www.youtube.com/watch?v=vpiy4frgCaA&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=10",
  },
  {
    sessionid: 11,
    sessiontitle: "Special sessions on training on CTPr Training - Day 1",
    sessiondate: "2024-04-16",
    sessiontime: "11:30",
    sessionlink: "https://www.youtube.com/watch?v=WFMsVn6ql0g&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=11",
  },
  {
    sessionid: 12,
    sessiontitle: "Special sessions on training on CTPr Training - Day 2",
    sessiondate: "2024-04-17",
    sessiontime: "15:00",
    sessionlink: "https://www.youtube.com/watch?v=3LZET_zaqbA&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=12",
  },
];

// Load email to name mapping from public/names.json
const emailToName = new Map<string, string>();
fetch("/names.json")
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch names.json");
    return res.json();
  })
  .then((data) => {
    Object.entries(data).forEach(([email, name]) => {
      emailToName.set(email.toString().toLowerCase().trim(), name as string);
    });
  })
  .catch((error) => {
    console.warn("Failed to load names.json:", error);
  });

export default function PreviousSessions() {
  const auth = useAuth() as any;
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) router.push("/");
  }, [auth, router]);

  if (!auth || auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }
  if (!auth.user) return null;

  const handleSignOut = async () => {
    await auth.signOut?.();
    router.push("/");
  };

  const getUserDisplayName = () => {
    const userEmail = auth.user?.email?.toString().toLowerCase().trim();
    if (userEmail && emailToName.has(userEmail)) {
      return emailToName.get(userEmail);
    }
    return "User";
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ---------- DESKTOP SIDEBAR (FIXED) ---------- */}
      <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col sticky top-0 h-screen overflow-y-auto">
        <nav className="flex-1 mt-4 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link
            href="/results"
            className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
          >
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
          <Link
            href="/sessions"
            className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
          >
            <ClipboardList className="w-5 h-5 mr-3" /> Sessions
          </Link>
          <Link
            href="/previous"
            className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
          >
            <History className="w-5 h-5 mr-3" /> Previous Sessions
          </Link>
          <Link
            href="/vlogs"
            className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
          >
            <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
          </Link>
          <Link
            href="/schedule"
            className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
          >
            <GraduationCap className="w-5 h-5 mr-3" /> Exam schedule
          </Link>
          <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
        </nav>
      </aside>

      {/* ---------- MOBILE BOTTOM NAV ---------- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="flex justify-around items-center py-2">
          <Link href="/dashboard" className="flex flex-col items-center text-xs text-gray-700">
            <LayoutDashboard className="w-6 h-6 mb-1" /> Dashboard
          </Link>
          <Link href="/results" className="flex flex-col items-center text-xs text-gray-700">
            <ClipboardList className="w-6 h-6 mb-1" /> Results
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-xs text-gray-700">
            <ClipboardList className="w-6 h-6 mb-1" /> Sessions
          </Link>
          <Link href="/previous" className="flex flex-col items-center text-xs font-bold text-[#0062cc]">
            <History className="w-6 h-6 mb-1" /> Prev
          </Link>
          <Link href="/vlogs" className="flex flex-col items-center text-xs text-gray-700">
            <ClipboardList className="w-6 h-6 mb-1" /> B/Vlogs
          </Link>
          <Link href="/schedule" className="flex flex-col items-center text-xs text-gray-700">
            <GraduationCap className="w-6 h-6 mb-1" /> Exam schedule
          </Link>
          <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
          <button onClick={handleSignOut} className="flex flex-col items-center text-xs text-red-600">
            <LogOut className="w-6 h-6 mb-1" /> Logout
          </button>
        </div>
      </nav>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="flex-1 flex flex-col">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 md:left-60 right-0 bg-white shadow-md z-40 flex items-center justify-between px-5 py-4">
          <div className="relative w-20 h-20 md:w-28 md:h-28">
             <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
              <User2 className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800 text-sm md:text-base">
                {getUserDisplayName()}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
<main className="flex-1 pt-32 md:pt-38 pb-24 md:pb-12 px-5 md:px-8 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 mt-4">
              Previous Sessions
            </h1>

            {PREVIOUS_SESSIONS.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No previous sessions found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {PREVIOUS_SESSIONS.map((session) => {
                  const youtubeId = extractYouTubeId(session.sessionlink);
                  const isYoutube = !!youtubeId;

                  return (
                    <div
                      key={session.sessionid}
                      onClick={() =>
                        isYoutube &&
                        window.open(`https://www.youtube.com/watch?v=${youtubeId}`, "_blank")
                      }
                      className="group bg-white rounded-xl border border-gray-200 hover:border-crimson-600 transition-all cursor-pointer shadow-md hover:shadow-xl overflow-hidden transform hover:-translate-y-1 duration-200"
                    >
                      <div
                        className="relative h-48 w-full flex items-center justify-center overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, #dc143c 0%, #b22222 70%, #8b0000 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-40"></div>

                        {isYoutube ? (
                          <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <History className="w-14 h-14 text-white/80" />
                        )}
                      </div>

                      <div className="p-5">
                        <h4 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 mb-3 leading-tight">
                          {session.sessiontitle}
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p className="font-medium">
                            {session.sessiondate.replace(/-/g, " / ")}
                          </p>
                          <p className="text-gray-500">{session.sessiontime}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Extra bottom padding for mobile */}
          <div className="h-20 md:hidden"></div>
        </main>
      </div>
    </div>
  );
}