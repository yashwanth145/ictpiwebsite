"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, User2, LogOut, History, Search,GraduationCap } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/ICTPL_image.png";
import { supabase } from "@/lib/Supabase";

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

const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(([email, name]) => {
  emailToName.set(email.toLowerCase(), name);
});

interface Candidate {
  membership_id: number;
  name: string;
  place: string | null;
  state: string | null;
  can_id: string;
  batch_id: string | null;
  batch_name: string | null;
  exam_date: string | null;
}

export default function MemberSearchPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) router.push("/");
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      await auth?.signOut?.();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getUserDisplayName = () => {
    const userEmail = auth?.user?.email?.toLowerCase();
    if (userEmail && emailToName.has(userEmail)) {
      return emailToName.get(userEmail)!;
    }
    return auth?.user?.email?.split("@")[0] || "User";
  };

  useEffect(() => {
    if (!auth?.user) return;

    const fetchCandidate = async () => {
      setLoading(true);
      setError(null);

      const userName = getUserDisplayName();

      try {
        const { data, error } = await supabase
          .from("candidate_exam_schedule")
          .select("*")
          .ilike("name", userName)
          .maybeSingle();

        if (error) {
          setError("Failed to fetch your details.");
        } else if (!data) {
          setError(`No record found for ${userName}`);
        } else {
          setCandidate(data);
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [auth?.user]);

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
          <Link href="/results" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
          <Link href="/member-search" className="flex items-center px-5 py-2 bg-blue-500">
            <Search className="w-5 h-5 mr-3" /> Member Search
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

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-xs"><LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard</Link>
        <Link href="/results" className="flex flex-col items-center text-xs"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
        <Link href="/member-search" className="flex flex-col items-center text-xs"><Search className="w-5 h-5 mb-1" /> Search</Link>
        <Link href="/sessions" className="flex flex-col items-center text-xs"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
        <Link href="/previous" className="flex flex-col items-center text-xs"><History className="w-5 h-5 mb-1" /> Previous</Link>
                <Link href="/vlogs" className="flex flex-col items-center text-xs"><ClipboardList className="w-5 h-5 mb-1" /> Vlogs</Link>
                        <Link href="/schedule" className="flex flex-col items-center text-xs"><GraduationCap className="w-5 h-5 mb-1" /> Schedule</Link>

        <button onClick={handleSignOut} className="flex flex-col items-center text-xs"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
          <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-gray-700" />
              <div className="text-sm text-gray-800 text-right">
                <div className="font-semibold truncate max-w-[150px] md:max-w-none">
                  {getUserDisplayName()}
                </div>
              </div>
            </div>
            <button onClick={handleSignOut} className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable Full Page Content */}
        <main className="flex-1 bg-gray-100 px-4 py-10 md:p-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
              Your Membership Details
            </h1>

            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading your profile...</p>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center mb-8">
                {error}
              </div>
            )}

            {/* THE CARD — FULLY SCROLLABLE WITH PAGE */}
            {candidate && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Blue Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold">Candidate Profile</h2>
                  <p className="mt-2 text-blue-100 text-lg">All your exam & membership information</p>
                </div>

                {/* Card Content - No internal scroll */}
                <div className="p-6 md:p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoBox label="Membership ID" value={candidate.membership_id.toString()} />
                    <InfoBox label="Full Name" value={candidate.name} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoBox label="Candidate ID" value={candidate.can_id} highlight />
                    <InfoBox
                      label="Exam Date"
                      value={
                        candidate.exam_date
                          ? new Date(candidate.exam_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "Not scheduled"
                      } highlight
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoBox label="Place" value={candidate.place || "—"} />
                    <InfoBox label="State" value={candidate.state || "—"} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoBox label="Batch ID" value={candidate.batch_id || "—"} />
                    <InfoBox label="Batch Name" value={candidate.batch_name || "—"} />
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-5 text-center text-sm text-gray-600 border-t">
                  Your information is securely fetched from the official database.
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-gray-50 p-5 rounded-xl border ${highlight ? "border-blue-300 shadow-md" : "border-gray-200"}`}>
      <span className="text-sm font-medium text-gray-600 block">{label}</span>
      <p className={`text-xl font-bold mt-1 ${highlight ? "text-blue-700" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}