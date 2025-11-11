"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  User2,
  LogOut,
  History,
  GraduationCap,
  ClipboardPenLine,
} from "lucide-react";
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
    return (
      <p className="text-center mt-32 text-gray-600 text-lg">Loading...</p>
    );
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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sticky Left Sidebar with Logo */}
      <aside className="hidden md:block w-64 bg-[#0062cc] text-white flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Logo Section */}
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/results", icon: ClipboardList, label: "Results" },
            { href: "/sessions", icon: ClipboardList, label: "Sessions" },
            { href: "/previous", icon: History, label: "Previous Sessions" },
            { href: "/vlogs", icon: ClipboardList, label: "B/Vlogs" },
            { href: "/schedule", icon: GraduationCap, label: "Exam Schedule" },
            { href: "/modelpaper", icon: ClipboardPenLine, label: "Model Papers" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-40">
          <div className="flex flex-col md:flex-row items-center justify-between px-4 py-4 gap-4">
           <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
          <div className="md:hidden">
            </div>

            {/* MEPSC Announcement */}
            <div className="flex-1 flex justify-center">
              <Link href="/schedule" className="group relative">
                <div className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs md:text-sm lg:text-base px-5 py-3 rounded-xl shadow-2xl transition-all transform hover:scale-105 animate-pulse text-center leading-tight">
                  <span className="tracking-wider block">MEPSC ASSESSMENT</span>
                  <span className="tracking-wider block">STARTS FROM TOMORROW</span>
                  <span className="text-xs opacity-90 block mt-1">
                    Tap to view your schedule
                  </span>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-4 whitespace-nowrap shadow-2xl">
                    Click to view Exam Schedule
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
                </div>
              </Link>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-right">
                <User2 className="w-8 h-8 text-gray-700" />
                <div>
                  <p className="text-xs text-gray-500">Welcome back,</p>
                  <p className="font-bold text-gray-800 truncate max-w-[160px]">
                    {getUserDisplayName()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center p-16 bg-white rounded-3xl shadow-2xl border border-gray-200">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6">
                <em>Coming Soon</em>
              </h1>
             
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation - Horizontal Scroll */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white z-50 shadow-2xl">
          <div className="flex overflow-x-auto scrollbar-hide py-3 px-2">
            {[
              { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
              { href: "/results", icon: ClipboardList, label: "Results" },
              { href: "/sessions", icon: ClipboardList, label: "Sessions" },
              { href: "/previous", icon: History, label: "Prev" },
              { href: "/vlogs", icon: ClipboardList, label: "Vlogs" },
              { href: "/schedule", icon: GraduationCap, label: "Schedule" },
              { href: "/modelpaper", icon: ClipboardPenLine, label: "Papers" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center min-w-[70px] px-3 py-2 text-xs font-medium"
              >
                <item.icon className="w-6 h-6 mb-1" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center min-w-[70px] px-3 py-2 text-xs font-medium text-red-200"
            >
              <LogOut className="w-6 h-6 mb-1" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}