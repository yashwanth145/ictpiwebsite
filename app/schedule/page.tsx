"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, User2, LogOut, History, Search, GraduationCap, X ,ClipboardPenLine} from "lucide-react";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a Membership ID or Candidate ID");
      return;
    }

    setLoading(true);
    setError(null);
    setCandidate(null);
    setHasSearched(true);

    try {
      const query = searchQuery.trim();

      // Try searching by membership_id (number) first
      let { data, error } = await supabase
        .from("candidate_exam_schedule")
        .select("*")
        .or(`membership_id.eq.${query},can_id.ilike.${query}`)
        .single();

      if (error && error.code === "PGRST116") {
        // No rows returned
        setError("No member found with that ID. Please check and try again.");
      } else if (error) {
        setError("Failed to search. Please try again later.");
        console.error(error);
      } else {
        setCandidate(data);
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCandidate(null);
    setError(null);
    setHasSearched(false);
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
          <Link href="/results" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
         
          <Link href="/sessions" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Sessions
          </Link>
          <Link href="/previous" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <History className="w-5 h-5 mr-3" /> Previous sessions
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
        <Link href="/dashboard" className="flex flex-col items-center"><LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard</Link>
        <Link href="/results" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
        <Link href="/sessions" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
        <Link href="/previous" className="flex flex-col items-center"><History className="w-5 h-5 mb-1" /> Previous</Link>
        <Link href="/vlogs" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> B/Vlogs</Link>
        <Link href="/schedule" className="flex flex-col items-center"><GraduationCap className="w-5 h-5 mb-1" /> Exam schedule</Link>
        <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
        <button onClick={handleSignOut} className="flex flex-col items-center"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
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
        <main className="flex-1 bg-gray-100 px-4 py-8 md:p-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
              Member Search
            </h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-10">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Member ID"
                  className="w-full px-5 py-4 pr-12 text-lg rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-black"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Searching member...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center mb-8">
                {error}
              </div>
            )}

            {/* No Search Yet */}
            {!hasSearched && !loading && !candidate && (
              <div className="text-center py-20 text-black">
                <Search className="w-16 h-16 mx-auto mb-4 text-black" />
                <p className="text-lg">Enter a Membership ID or Candidate ID to search</p>
              </div>
            )}

            {/* Candidate Card */}
            {candidate && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold">Candidate Profile</h2>
                  <p className="mt-2 text-blue-100 text-lg">Membership & Exam Information</p>
                </div>

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
                      }
                      highlight
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

                <div className="bg-gray-50 px-8 py-5 text-center text-sm text-gray-600 border-t">
                  Information fetched securely from the official database.
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