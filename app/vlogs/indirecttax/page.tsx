"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import indirecttax from "../../../assets/directtax.webp";
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

export default function IndirectTaxPage() {
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

  // All real PDFs from your original structure + mentor assigned
  const allPDFs: PDFCard[] = [
    // GST LAWS
    { title: "Fundamentals of GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-1 Fundamentals of GST.pdf", download: "Chapter-1 Fundamentals of GST.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Basics of GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-2 Basics of GST.pdf", download: "Chapter-2 Basics of GST.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "One Nation-One Tax", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-3 One Nation-One Tax.pdf", download: "Chapter-3 One Nation-One Tax.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Goods and Services Tax Network (GSTN)", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-4 Goods and Services Tax Network (GSTN).pdf", download: "Chapter-4 Goods and Services Tax Network (GSTN).pdf", mentor: "Prof. Amit Verma" },
    { title: "GST Council", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-5 GST Council.pdf", download: "Chapter-5 GST Council.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Important Definitions", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-6 Important Definitions.pdf", download: "Chapter-6 Important Definitions.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Supply under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-7 Supply.pdf", download: "Chapter-7 Supply.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Composite and Mixed Supplies", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-8 Composite and Mixed Supplies.pdf", download: "Chapter-8 Composite and Mixed Supplies.pdf", mentor: "Prof. Amit Verma" },
    { title: "Levy and Collection", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-9 Levy and Collection.pdf", download: "Chapter-9 Levy and Collection.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Composition Levy", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-10Composition Levy.pdf", download: "Chapter-10Composition Levy.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Exemptions under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-11 Exemptions.pdf", download: "Chapter-11 Exemptions.pdf", mentor: "Prof. Amit Verma" },
    { title: "Reverse Charge Mechanism (RCM)", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-12 Reverse Charge Mechanism (RCM).pdf", download: "Chapter-12 Reverse Charge Mechanism (RCM).pdf", mentor: "CA Rakesh Sharma" },
    { title: "Time of Supply", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-13 Time of Supply.pdf", download: "Chapter-13 Time of Supply.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Place of Supply", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-14 Place of Supply.pdf", download: "Chapter-14 Place of Supply.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Value of Supply", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-15 Value of Supply.pdf", download: "Chapter-15 Value of Supply.pdf", mentor: "Prof. Amit Verma" },
    { title: "Registration under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-16 Registration under GST.pdf", download: "Chapter-16 Registration under GST.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Offences and Penalties", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-21 Offences and Penalties under GST.pdf", download: "Chapter-21 Offences and Penalties under GST.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Accounts and Records", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-23 Accounts and Records under GST.pdf", download: "Chapter-23 Accounts and Records under GST.pdf", mentor: "Prof. Amit Verma" },
    { title: "Assessment under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-24 Assessment.pdf", download: "Chapter-24 Assessment.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Audit under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-25 Audit.pdf", download: "Chapter-25 Audit.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "TDS under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-27 TDS under GST.pdf", download: "Chapter-27 TDS under GST.pdf", mentor: "Prof. Amit Verma" },
    { title: "TCS under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-28 TCS under GST.pdf", download: "Chapter-28 TCS under GST.pdf", mentor: "CA Rakesh Sharma" },
    { title: "GST Practitioners", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-29 GST Practitioners.pdf", download: "Chapter-29 GST Practitioners.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Anti-Profiteering", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-30Anti-Profiteering.pdf", download: "Chapter-30Anti-Profiteering.pdf", mentor: "Prof. Amit Verma" },
    { title: "Demand and Adjudication", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-31 Demand and Adjudication.pdf", download: "Chapter-31 Demand and Adjudication.pdf", mentor: "CA Rakesh Sharma" },
    { title: "GST Compensation Act", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-35 Goods and Services Tax (Compensation to States) Act, 2017.pdf", download: "Chapter-35 Goods and Services Tax (Compensation to States) Act, 2017.pdf", mentor: "Adv. Neha Kapoor" },

    // Customs Act
    { title: "Basic Concepts of Customs", src: "/pdf/indirecttax/customsact/Chapter-1 Basic Concepts.pdf", download: "Chapter-1 Basic Concepts.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Valuation under Customs", src: "/pdf/indirecttax/customsact/Chapter-2 Valuation under Customs.pdf", download: "Chapter-2 Valuation under Customs.pdf", mentor: "Prof. Amit Verma" },
    { title: "Types of Duties", src: "/pdf/indirecttax/customsact/Chapter-3Types of Duties.pdf", download: "Chapter-3Types of Duties.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Administrative Aspects", src: "/pdf/indirecttax/customsact/Chapter-4 Administrative and Other Aspects.pdf", download: "Chapter-4 Administrative and Other Aspects.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Import and Export Procedure", src: "/pdf/indirecttax/customsact/Chapter-5 Import and Export Procedure.pdf", download: "Chapter-5 Import and Export Procedure.pdf", mentor: "Prof. Amit Verma" },
    { title: "Baggage Rules", src: "/pdf/indirecttax/customsact/Chapter-6 Baggage.pdf", download: "Chapter-6 Baggage.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Appeals under Customs", src: "/pdf/indirecttax/customsact/Chapter-7 Appeals under Customs.pdf", download: "Chapter-7 Appeals under Customs.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Appeal to Commissioner", src: "/pdf/indirecttax/customsact/Chapter-8 Appeal to Commissioner (Appeal).pdf", download: "Chapter-8 Appeal to Commissioner (Appeal).pdf", mentor: "Prof. Amit Verma" },
    { title: "Appeals to CESTAT", src: "/pdf/indirecttax/customsact/Chapter-9 Appeals to the Customs, Excise and Service Tax Appellate Tribunal (CESTAT).pdf", download: "Chapter-9 Appeals to the Customs, Excise and Service Tax Appellate Tribunal (CESTAT).pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Appeals to High Court", src: "/pdf/indirecttax/customsact/Chapter-10 Appeals to High Court.pdf", download: "Chapter-10 Appeals to High Court.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Settlement Commission", src: "/pdf/indirecttax/customsact/Chapter-12 Appeals to the Settlement Commission.pdf", download: "Chapter-12 Appeals to the Settlement Commission.pdf", mentor: "Prof. Amit Verma" },
    { title: "Authority for Advance Ruling", src: "/pdf/indirecttax/customsact/Chapter-13 Authority for Advance Ruling.pdf", download: "Chapter-13 Authority for Advance Ruling.pdf", mentor: "Adv. Neha Kapoor" },
    { title: "Foreign Trade Policy 2015-2020", src: "/pdf/indirecttax/customsact/Chapter-14 Foreign Trade Policy 2015-2020.pdf", download: "Chapter-14 Foreign Trade Policy 2015-2020.pdf", mentor: "CA Rakesh Sharma" },
    { title: "Comprehensive Issues under Customs", src: "/pdf/indirecttax/customsact/Chapter-15 Comprehensive Issues under Customs.pdf", download: "Chapter-15 Comprehensive Issues under Customs.pdf", mentor: "Prof. Amit Verma" },
  ];

  // Extract unique mentors
  const mentors = Array.from(new Set(allPDFs.map(pdf => pdf.mentor))).sort();

  // Filter by selected mentor
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
                src={indirecttax}
                alt="Indirect Taxation Laws and Compliance"
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
                Indirect Taxation Laws & Compliance (GST + Customs)
              </h1>
              <p className="mt-3 text-gray-600">
                Select a mentor to access their exclusive study material
              </p>
            </div>
          </div>
        </div>

        {/* Mentor Dropdown */}
        <div className="mb-10 bg-white p-6 rounded-xl shadow-md text-black">
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
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-75" onClick={handleCloseModal}>
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