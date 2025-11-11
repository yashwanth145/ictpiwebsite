"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, User2, LogOut, History, GraduationCap ,ClipboardPenLine} from "lucide-react";
import Image from "next/image";

// Assets
import logo from "../../assets/ICTPL_image.png";

// Email → Name mapping
import emailNamePairs from "../../public/names.json";

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

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) {
      router.push("/");
    }
  }, [auth, router]);

  if (!auth || auth.loading) {
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  }
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

  /* ---------- Get Full Name from Email ---------- */
  const getUserDisplayName = () => {
    const userEmail = auth.user?.email?.toLowerCase();
    if (userEmail && emailToName.has(userEmail)) {
      return emailToName.get(userEmail)!;
    }
    return auth.user?.email?.split("@")[0] || "User";
  };

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col">
          <nav className="flex-1 mt-4 space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link
              href="/results"
              className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
            >
              <ClipboardList className="w-5 h-5 mr-3" />
              Result
            </Link>
            <Link
              href="/sessions"
              className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
            >
              <ClipboardList className="w-5 h-5 mr-3" />
              Sessions
            </Link>
            <Link
              href="/previous"
              className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
            >
              <History className="w-5 h-5 mr-3" />
              Previous Sessions
            </Link>
            <Link
              href="/vlogs"
              className="flex items-center px-5 py-2 hover:bg-blue-500 transition"
            >
              <ClipboardList className="w-5 h-5 mr-3" />
              B/Vlogs
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

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50">
          <Link href="/dashboard" className="flex flex-col items-center text-xs">
            <LayoutDashboard className="w-5 h-5 mb-1" />
            Dashboard
          </Link>
          <Link href="/results" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" />
            Results
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" />
            Sessions
          </Link>
          <Link href="/previous" className="flex flex-col items-center text-xs">
            <History className="w-5 h-5 mb-1" />
            Previous Sessions
          </Link>
          <Link href="/vlogs" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" />
            B/VLogs
          </Link>
          <Link href="/schedule" className="flex flex-col items-center text-xs">
            <GraduationCap className="w-5 h-5 mb-1" />
            Schedule
          </Link>
          <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center text-xs"
          >
            <LogOut className="w-5 h-5 mb-1" />
            Logout
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
            <Image
              src={logo}
              alt="Logo"
              className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
            />

            {/* User Info */}
            <div className="flex md:ml-[600px] gap-2">
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
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </header>

          {/* Coming Soon Message */}
          <main className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                <em>Coming Soon</em>
              </h1>
              
            </div>
          </main>
        </div>
      </div>
    </>
  );
}