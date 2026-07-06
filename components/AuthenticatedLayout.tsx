"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { PremiumModeButton } from "@/components/PremiumModeButton";
import { usePortalMode } from "@/lib/portalTheme";
import {
  LayoutDashboard,
  ClipboardList,
  History,
  ClipboardPenLine,
  FileCheck,
  LogOut,
  ArrowLeft,
  User2,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/lib/Supabase";
import { loadMemberProfileByMembershipId } from "@/lib/candidateExamSchedule";
import { getStoredMembershipId, getStoredMemberName } from "@/lib/memberSession";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/results", label: "Exam Information", icon: ClipboardList },
  { href: "/sessions", label: "Sessions", icon: ClipboardList },
  { href: "/previous", label: "Previous Sessions", icon: History },
  { href: "/vlogs", label: "B/Vlogs", icon: ClipboardList },
  { href: "/modelpaper", label: "Model papers", icon: ClipboardPenLine },
  { href: "/tests", label: "Practice Tests", icon: ClipboardPenLine },
  { href: "/certificates", label: "Certificates", icon: FileCheck },
  { href: "/enquiry", label: "Enquiry / Issue", icon: MessageSquare },
] as const;

/** Map standard portal routes to premium mirrors under /premium */
const PREMIUM_NAV_HREF: Partial<Record<string, string>> = {
  "/results": "/premium/results",
  "/sessions": "/premium/sessions",
  "/vlogs": "/premium/vlogs",
  "/tests": "/premium/tests",
  "/certificates": "/premium/certificates",
};

function navHrefForPortal(baseHref: string, isPremium: boolean, homeHref: string) {
  if (!isPremium) return baseHref;
  if (baseHref === "/dashboard") return homeHref;
  return PREMIUM_NAV_HREF[baseHref] ?? baseHref;
}

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  backHref?: string;
  /** Extra header content (e.g. action buttons) */
  headerActions?: React.ReactNode;
  /** Max width of main content: "sm" | "md" | "lg" | "full" */
  maxWidth?: "sm" | "md" | "lg" | "full";
}

const maxWidthClass = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  full: "max-w-[1400px]",
};

export function AuthenticatedLayout({
  children,
  title,
  showBack = false,
  backHref = "/dashboard",
  headerActions,
  maxWidth = "lg",
}: AuthenticatedLayoutProps) {
  const auth = useAuth() as any;
  const router = useRouter();
  const { isPremium } = usePortalMode();
  const [fullName, setFullName] = useState<string>("User");
  const homeHref = isPremium ? "/premium" : "/dashboard";
  const sidebarBgClass = isPremium ? "md:bg-purple-700" : "md:bg-[#0062cc]";
  const mobileSidebarBgClass = isPremium ? "bg-purple-700/95" : "bg-[#0062cc]/95";
  const navLinks = isPremium
    ? NAV_LINKS.filter(({ href }) => href !== "/results")
    : NAV_LINKS;

  useEffect(() => {
    if (!auth?.user?.email) return;
    const email = auth.user.email.toLowerCase().trim();
    const fetchUser = async () => {
      try {
        const { data: payload } = await loadMemberProfileByMembershipId(
          supabase,
          getStoredMembershipId()
        );
        const nameFromDb =
          payload?.member?.name?.trim() || getStoredMemberName()?.trim();
        if (nameFromDb) setFullName(nameFromDb);
        else setFullName(email.split("@")[0] || "User");
      } catch {
        setFullName(email.split("@")[0] || "User");
      }
    };
    fetchUser();
  }, [auth?.user?.email]);

  useEffect(() => {
    if (!auth?.loading && !auth?.user) router.push("/");
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      if (auth?.signOut) await auth.signOut();
      await supabase.auth.signOut();
      router.push("/");
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  if (!auth || auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">Loading...</p>
      </div>
    );
  }
  if (!auth.user) return null;

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
        <aside
          className={`hidden md:sticky md:top-0 md:flex md:flex-col md:w-60 md:h-screen ${sidebarBgClass} md:text-white md:overflow-y-auto scrollbar-hide`}
        >
          <nav className="flex-1 mt-4 space-y-3 px-3">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={navHrefForPortal(href, isPremium, homeHref)}
                className="flex items-center px-5 py-2 rounded-lg hover:bg-blue-500/80 transition-colors"
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav
          className={`md:hidden fixed bottom-0 left-0 right-0 ${mobileSidebarBgClass} backdrop-blur-sm text-white flex flex-nowrap justify-start items-center gap-3 overflow-x-auto py-2 px-2 shadow-lg z-50 text-xs scrollbar-hide`}
        >
          <Link href={homeHref} className="flex flex-col items-center py-1 shrink-0 min-w-[52px]">
            <LayoutDashboard className="w-5 h-5 mb-1" /> {isPremium ? "Dash" : "Dashboard"}
          </Link>
          {!isPremium && (
            <Link href="/results" className="flex flex-col items-center py-1 shrink-0 min-w-[52px]">
              <ClipboardList className="w-5 h-5 mb-1" /> Exam Information
            </Link>
          )}
          <Link href={navHrefForPortal("/sessions", isPremium, homeHref)} className="flex flex-col items-center py-1 shrink-0 min-w-[52px]">
            <ClipboardList className="w-5 h-5 mb-1" /> Sessions
          </Link>
          <Link href="/previous" className="flex flex-col items-center py-1 shrink-0 min-w-[52px]">
            <History className="w-5 h-5 mb-1" /> Prev
          </Link>
          
          <Link href="/modelpaper" className="flex flex-col items-center py-1 shrink-0 min-w-[52px]">
            <ClipboardPenLine className="w-5 h-5 mb-1" /> Papers
          </Link>
          <Link href={navHrefForPortal("/tests", isPremium, homeHref)} className="flex flex-col items-center py-1 shrink-0 min-w-[52px]">
            <ClipboardPenLine className="w-5 h-5 mb-1" /> Tests
          </Link>
          <Link href={navHrefForPortal("/certificates", isPremium, homeHref)} className="flex flex-col items-center py-1 shrink-0 min-w-[52px]">
            <FileCheck className="w-5 h-5 mb-1" /> Certs
          </Link>
          <Link href="/enquiry" className="flex flex-col items-center py-1 shrink-0 min-w-[52px]">
            <MessageSquare className="w-5 h-5 mb-1" /> Enquiry
          </Link>
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center py-1 shrink-0 min-w-[52px]"
          >
            <LogOut className="w-5 h-5 mb-1" /> Logout
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow px-4 md:px-6 py-4 sticky top-0 z-40 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {showBack && (
                <button
                  onClick={() => router.push(backHref)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-800" />
                </button>
              )}
              <AppLogo variant="header" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-end">
              <Link
                href="/profile"
                className="flex items-center gap-3 hover:opacity-90 transition-all group"
                title="View profile"
              >
                <div className="bg-blue-50 text-blue-700 rounded-full p-2.5 group-hover:bg-blue-100 transition-colors">
                  <User2 className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-gray-800 truncate max-w-[140px] md:max-w-[180px]">
                  {fullName}
                </span>
              </Link>
              <PremiumModeButton currentEmail={auth.user.email} compact />
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
              {headerActions}
            </div>
          </header>

          <main className={`flex-1 overflow-y-auto pb-24 md:pb-8 px-4 md:px-6 py-6 md:py-8 ${maxWidthClass[maxWidth]} mx-auto w-full`}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
