"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import complaince from "../../../assets/complaiance.webp";
import "../../globals.css";

interface AuthContextType {
  user: { uid: string; email: string } | null;
  loading: boolean;
}

interface PDFCard {
  title: string;
  src: string;
  download: string;
  mentor: string;
}

export default function BusinessRegulatoryPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<string>("all");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !showModal) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [mounted, showModal]);

  useEffect(() => {
    if (!auth || auth.loading || !mounted) return;
    if (!auth.user) router.push("/");
  }, [auth, router, mounted]);

  if (!mounted || !auth || auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }
  if (!auth.user) return null;

  // All PDFs with realistic mentor assignment
  const allPDFs: PDFCard[] = [
    { title: "Choice of Business Organizations", src: "/pdf/bussiness/advising/Choice of Business Organisation.pdf", download: "Choice of Business Organisation.pdf", mentor: "CA Neha Gupta" },
    { title: "Types of Companies", src: "/pdf/bussiness/advising/Types of Companies.pdf", download: "Types of Companies.pdf", mentor: "Adv. Rohan Malhotra" },
    { title: "Charter Documents of Companies", src: "/pdf/bussiness/advising/Charter Documents of companies.pdf", download: "Charter Documents of companies.pdf", mentor: "CS Priyanka Verma" },
    { title: "Formation of LLP", src: "/pdf/bussiness/advising/Fomation of LLP.pdf", download: "Fomation of LLP.pdf", mentor: "CA Neha Gupta" },
    { title: "Startups and Registration", src: "/pdf/bussiness/advising/Startups and it's registrations.pdf", download: "Startups and it's registrations.pdf", mentor: "Adv. Rohan Malhotra" },
    { title: "Business Collaborations", src: "/pdf/bussiness/advising/Business Collaborations.pdf", download: "Business Collaborations.pdf", mentor: "CS Priyanka Verma" },
    { title: "Conversion of Business Entities", src: "/pdf/bussiness/advising/Conversion of  Business Entities.pdf", download: "Conversion of Business Entities.pdf", mentor: "CA Neha Gupta" },
    { title: "Maintenance of Registers and Records", src: "/pdf/bussiness/bussinessmaintaince/Maintenance of Registers and Records.pdf", download: "Maintenance of Registers and Records.pdf", mentor: "Adv. Rohan Malhotra" },
    { title: "Labour Law Compliances", src: "/pdf/bussiness/bussinessmaintaince/Compliance's under labour Laws.pdf", download: "Compliance's under labour Laws.pdf", mentor: "CS Priyanka Verma" },
    { title: "Environmental Law Compliances", src: "/pdf/bussiness/bussinessmaintaince/Compliance's relating to environmental laws.pdf", download: "Compliance's relating to environmental laws.pdf", mentor: "CA Neha Gupta" },
    { title: "Dormant Company", src: "/pdf/bussiness/procedure/Dormant Company.pdf", download: "Dormant Company.pdf", mentor: "Adv. Rohan Malhotra" },
    { title: "Strike Off & Restoration", src: "/pdf/bussiness/procedure/Strike off and Restoration of Name of Co and LLP.pdf", download: "Strike off and Restoration of Name of Co and LLP.pdf", mentor: "CS Priyanka Verma" },
    { title: "Corporate Insolvency Overview", src: "/pdf/bussiness/procedure/Corporate Insolvency Resolution Process,Liquidation &.winding up_ An Overview.pdf", download: "Corporate Insolvency Resolution Process,Liquidation &.winding up_ An Overview.pdf", mentor: "CA Neha Gupta" },
    { title: "Indian Contract Act, 1872", src: "/pdf/bussiness/appendix/INDIAN CONTRACT ACT, 1872.pdf", download: "INDIAN CONTRACT ACT, 1872.pdf", mentor: "Adv. Rohan Malhotra" },
    { title: "Sale of Goods Act, 1930", src: "/pdf/bussiness/appendix/SALE OF GOODS ACT, 1930.pdf", download: "SALE OF GOODS ACT, 1930.pdf", mentor: "CS Priyanka Verma" },
    { title: "Negotiable Instruments Act", src: "/pdf/bussiness/appendix/NEGOTIABLE INSTRUMENT ACT, 1881.pdf", download: "NEGOTIABLE INSTRUMENT ACT, 1881.pdf", mentor: "CA Neha Gupta" },
    { title: "Companies Act, 2013", src: "/pdf/bussiness/appendix/COMPANIES ACT, 2013.pdf", download: "COMPANIES ACT, 2013.pdf", mentor: "Adv. Rohan Malhotra" },
    { title: "LLP Act, 2008", src: "/pdf/bussiness/appendix/LIMITED LIABILITY PARTNERSHIP ACT, 2008.pdf", download: "LIMITED LIABILITY PARTNERSHIP ACT, 2008.pdf", mentor: "CS Priyanka Verma" },
    { title: "Factories Act, 1948", src: "/pdf/bussiness/appendix/FACTORIES ACT, 1948.pdf", download: "FACTORIES ACT, 1948.pdf", mentor: "CA Neha Gupta" },
    { title: "Payment of Bonus Act", src: "/pdf/bussiness/appendix/PAYMENT OF BONUS ACT, 1965.pdf", download: "PAYMENT OF BONUS ACT, 1965.pdf", mentor: "Adv. Rohan Malhotra" },
    { title: "Minimum Wages Act", src: "/pdf/bussiness/appendix/MINIMUM WAGES ACT, 1948.pdf", download: "MINIMUM WAGES ACT, 1948.pdf", mentor: "CS Priyanka Verma" },
    { title: "EPF & Misc Provisions", src: "/pdf/bussiness/appendix/EPF AND MISC. PROVISIONS ACT, 1952.pdf", download: "EPF AND MISC. PROVISIONS ACT, 1952.pdf", mentor: "CA Neha Gupta" },
  ];

  // Extract unique mentors
  const mentors = Array.from(new Set(allPDFs.map(pdf => pdf.mentor))).sort();

  // Filter PDFs by selected mentor
  const filteredPDFs = selectedMentor === "all" 
    ? allPDFs 
    : allPDFs.filter(pdf => pdf.mentor === selectedMentor);

  const handlePDFClick = (pdf: PDFCard) => {
    setSelectedPDF(pdf);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPDF(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/vlogs")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm sm:text-base font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64">
              <Image
                src={complaince}
                alt="Business Regulatory Framework"
                width={300}
                height={200}
                className="w-full h-48 object-cover md:h-full"
                priority
              />
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
              <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Business Regulatory Laws & Compliance
              </h1>
              <p className="mt-3 text-gray-600">
                Select a mentor to access their exclusive study material
              </p>
            </div>
          </div>
        </div>

        {/* Mentor Dropdown */}
        <div className="text-black mb-10 bg-white p-6 rounded-xl shadow-md">
          <label htmlFor="mentor" className="block text-lg font-semibold text-gray-800 mb-3">
            Choose Your Mentor
          </label>
          <select
            id="mentor"
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="w-full max-w-2xl px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
          >
            <option value="all">All Mentors ({allPDFs.length} notes)</option>
            {mentors.map(mentor => {
              const count = allPDFs.filter(p => p.mentor === mentor).length;
              return (
                <option key={mentor} value={mentor}>
                  {mentor} ({count} notes)
                </option>
              );
            })}
          </select>
        </div>

        {/* PDF Cards Grid */}
        {filteredPDFs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl">No notes available for this mentor yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredPDFs.map((pdf, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {pdf.title}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        {pdf.mentor}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handlePDFClick(pdf)}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View PDF
                    </button>
                    <a
                      href={pdf.src}
                      download={pdf.download}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-center"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen PDF Modal */}
      {showModal && selectedPDF && (
        <div 
          className="fixed inset-0 z-50 flex bg-black bg-opacity-75" 
          onClick={handleCloseModal}
        >
          <div 
            className="relative w-full max-w-6xl h-full max-h-screen m-4 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-4 max-w-[70%]">
                {selectedPDF.title} - {selectedPDF.mentor}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={selectedPDF.src}
                className="w-full h-full border-0"
                title={selectedPDF.title}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}