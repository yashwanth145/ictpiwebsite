"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, User2, LogOut ,History,GraduationCap} from "lucide-react";
import Image from "next/image";
import logo from "../../assets/ICTPL_image.png";

/* ─────── NEW: Email → Name Map ─────── */
import emailNamePairs from "../../public/names.json";

interface UserType {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  signOut?: () => Promise<void>;
}

/* ─────── Build Email to Name Map ─────── */
const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(([email, name]) => {
  emailToName.set(email.toLowerCase(), name);
});

const ResultPage = () => {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Redirect if no user
  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) router.push("/");
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      if (auth?.signOut) {
        await auth.signOut();
        router.push("/");
      } else {
        console.error("signOut is not a function");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleShowResults = () => {
    setResultMessage("Result not yet uploaded");
  };

  const handleGoBack = () => {
    router.push("/dashboard");
  };

  /* ─────── Get Full Name from Email ─────── */
  const getUserDisplayName = () => {
    const userEmail = auth?.user?.email?.toLowerCase();
    if (userEmail && emailToName.has(userEmail)) {
      return emailToName.get(userEmail)!;
    }
    // Fallback: show email prefix
    return auth?.user?.email?.split("@")[0] || "User";
  };

  if (!auth || auth.loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!auth.user) return null;

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col">
        <nav className="flex-1 mt-4 space-y-3">
          <Link href="/dashboard" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/results" className="flex items-center px-5 py-2 bg-blue-500">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
          <Link href="/sessions" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Sessions
          </Link>
          <Link href="/previous" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <History className="w-5 h-5 mr-3" /> Previous sessions
          </Link>
          <Link href="/vlogs" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Vlogs
          </Link>
          <Link href="/schedule" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <GraduationCap className="w-5 h-5 mr-3" /> Schedule
          </Link>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-xs">
          <LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard
        </Link>
        <Link href="/results" className="flex flex-col items-center text-xs">
          <ClipboardList className="w-5 h-5 mb-1" /> Results
        </Link>
        <Link href="/sessions" className="flex flex-col items-center text-xs">
          <ClipboardList className="w-5 h-5 mb-1" /> Sessions
        </Link>
        <Link href="/previous" className="flex flex-col items-center text-xs">
          <History className="w-5 h-5 mb-1" /> Previous Sessions
        </Link>
        <Link href="/vlogs" className="flex flex-col items-center text-xs">
          <ClipboardList className="w-5 h-5 mb-1" /> Vlogs
        </Link>
        
        <Link href="/schedule" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <GraduationCap className="w-5 h-5 mr-3" /> Schedule
          </Link>
        <button onClick={handleSignOut} className="flex flex-col items-center text-xs">
          <LogOut className="w-5 h-5 mb-1" /> Logout
        </button>

      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
          <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-gray-700" />
              <div className="text-sm text-gray-800 text-right">
                {/* FULL NAME ON RIGHT */}
                <div className="font-semibold truncate max-w-[150px] md:max-w-none">
                  {getUserDisplayName()}
                </div>
                {/* Optional: keep email below if needed */}
                
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Result Section */}
        <main className="p-8 flex flex-col items-center justify-center flex-1 relative bg-gray-100">
          <button
            onClick={handleShowResults}
            className="mb-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Show Results
          </button>

          {resultMessage && (
            <div
              style={{
                position: "relative",
                textAlign: "center",
                padding: "30px",
                background: "white",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                maxWidth: "400px",
                width: "100%",
              }}
            >
              <h2 style={{ color: "#2d3748", marginBottom: "16px" }}>Exam Results</h2>
              <p style={{ color: "#f97316", fontSize: "1.2em", fontWeight: "500" }}>
                {resultMessage}
              </p>
              <p className="text-gray-600 mt-2 text-sm">
                Please check back later or contact the administrator.
              </p>
              <button
                onClick={handleGoBack}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  background: "#4299e1",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Go Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResultPage;