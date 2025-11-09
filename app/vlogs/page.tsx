"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, User2, LogOut, History } from "lucide-react";
import Image from "next/image";

// Assets
import accountancy from "../../assets/Accountancy.webp";
import complaince from "../../assets/complaiance.webp";
import directax from "../../assets/directtax.webp";
import appliedfinance from "../../assets/fourthimage.webp";
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

  /* ---------- Course Data ---------- */
  const courses = [
    {
      title: "Indirect Tax Laws Compliance (ITXL)",
      route: "indirecttax",
      image: accountancy,
    },
    {
      title: "Business Regulatory Laws Compliance",
      route: "business",
      image: complaince,
    },
    {
      title: "Direct Tax Laws Compliance (DTLC)",
      route: "directtax",
      image: directax,
    },
    {
      title: "Applied Financial Accounting & Ethics",
      route: "appliedfinance",
      image: appliedfinance,
    },
  ];

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
              Vlogs
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
            Vlogs
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

          {/* Course Cards Grid */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 lg:gap-8 xl:gap-10 overflow-y-auto mb-[80px] md:mb-0 bg-gray-100">
            {courses.map((course, index) => (
              <div
                key={index}
                onClick={() => router.push(`/vlogs/${course.route}`)}
                className="bg-white shadow-md rounded-xl p-6 sm:p-8 lg:p-4 hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-md mb-6"
                />
                <h3 className="text-lg font-semibold text-gray-800 text-center">
                  {course.title}
                </h3>
              </div>
            ))}
          </main>
        </div>
      </div>
    </>
  );
}