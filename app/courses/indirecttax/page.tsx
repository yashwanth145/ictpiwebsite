"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
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
}

interface ConceptPDFs {
  [key: string]: PDFCard[];
}

export default function IndirectTaxPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);

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

  const conceptPDFs: ConceptPDFs = {
    "GST LAWS": [
      { title: "Chapter 1 - Fundamentals of GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-1 Fundamentals of GST.pdf", download: "Chapter-1 Fundamentals of GST.pdf" },
      { title: "Chapter 2 - Basics of GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-2 Basics of GST.pdf", download: "Chapter-2 Basics of GST.pdf" },
      { title: "Chapter 3 - One Nation-One Tax", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-3 One Nation-One Tax.pdf", download: "Chapter-3 One Nation-One Tax.pdf" },
      { title: "Chapter 4 - Goods and Services Tax Network", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-4 Goods and Services Tax Network (GSTN).pdf", download: "Chapter-4 Goods and Services Tax Network (GSTN).pdf" },
      { title: "Chapter 5 - GST Council", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-5 GST Council.pdf", download: "Chapter-5 GST Council.pdf" },
      { title: "Chapter 6 - Important Definitions", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-6 Important Definitions.pdf", download: "Chapter-6 Important Definitions.pdf" },
      { title: "Chapter 7 - Supply", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-7 Supply.pdf", download: "Chapter-7 Supply.pdf" },
      { title: "Chapter 8 - Composite and Mixed Supplies", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-8 Composite and Mixed Supplies.pdf", download: "Chapter-8 Composite and Mixed Supplies.pdf" },
      { title: "Chapter 9 - Levy and Collection", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-9 Levy and Collection.pdf", download: "Chapter-9 Levy and Collection.pdf" },
      { title: "Chapter 10 - Composition Levy", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-10Composition Levy.pdf", download: "Chapter-10Composition Levy.pdf" },
      { title: "Chapter 11 - Exemptions", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-11 Exemptions.pdf", download: "Chapter-11 Exemptions.pdf" },
      { title: "Chapter 12 - Reverse Charge Mechanism", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-12 Reverse Charge Mechanism (RCM).pdf", download: "Chapter-12 Reverse Charge Mechanism (RCM).pdf" },
      { title: "Chapter 13 - Time of Supply", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-13 Time of Supply.pdf", download: "Chapter-13 Time of Supply.pdf" },
      { title: "Chapter 14 - Place of Supply", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-14 Place of Supply.pdf", download: "Chapter-14 Place of Supply.pdf" },
      { title: "Chapter 15 - Value of Supply", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-15 Value of Supply.pdf", download: "Chapter-15 Value of Supply.pdf" },
      { title: "Chapter 16 - Registration under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-16 Registration under GST.pdf", download: "Chapter-16 Registration under GST.pdf" },
      { title: "Chapter 21 - Offences and Penalties under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-21 Offences and Penalties under GST.pdf", download: "Chapter-21 Offences and Penalties under GST.pdf" },
      { title: "Chapter 23 - Accounts and Records", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-23 Accounts and Records under GST.pdf", download: "Chapter-23 Accounts and Records under GST.pdf" },
      { title: "Chapter 24 - Assessment", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-24 Assessment.pdf", download: "Chapter-24 Assessment.pdf" },
      { title: "Chapter 25 - Audit", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-25 Audit.pdf", download: "Chapter-25 Audit.pdf" },
      { title: "Chapter-27 TDS under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-27 TDS under GST.pdf", download: "Chapter-27 TDS under GST.pdf" },
      { title: "Chapter-28 TCS under GST", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-28 TCS under GST.pdf", download: "Chapter-28 TCS under GST.pdf" },
      { title: "Chapter-29 GST Practitioners", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-29 GST Practitioners.pdf", download: "Chapter-29 GST Practitioners.pdf" },
      { title: "Chapter-30 Anti-Profiteering", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-30Anti-Profiteering.pdf", download: "Chapter-30Anti-Profiteering.pdf" },
      { title: "Chapter-31 Demand and Adjudication", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-31 Demand and Adjudication.pdf", download: "Chapter-31 Demand and Adjudication.pdf" },
      { title: "Chapter-35 Goods and Services Tax (Compensation to States) Act, 2017", src: "/pdf/indirecttax/goodsandservices(GST)/Chapter-35 Goods and Services Tax (Compensation to States) Act, 2017.pdf", download: "Chapter-35 Goods and Services Tax (Compensation to States) Act, 2017.pdf" },
    ],
    "Customs Act": [
      { title: "Chapter 1 - Basic Concepts", src: "/pdf/indirecttax/customsact/Chapter-1 Basic Concepts.pdf", download: "Chapter-1 Basic Concepts.pdf" },
      { title: "Chapter 2 - Valuation under Customs", src: "/pdf/indirecttax/customsact/Chapter-2 Valuation under Customs.pdf", download: "Chapter-2 Valuation under Customs.pdf" },
      { title: "Chapter 3 - Types of Duties", src: "/pdf/indirecttax/customsact/Chapter-3Types of Duties.pdf", download: "Chapter-3Types of Duties.pdf" },
      { title: "Chapter 4 - Administrative Aspects", src: "/pdf/indirecttax/customsact/Chapter-4 Administrative and Other Aspects.pdf", download: "Chapter-4 Administrative and Other Aspects.pdf" },
      { title: "Chapter 5 - Import and Export Procedure", src: "/pdf/indirecttax/customsact/Chapter-5 Import and Export Procedure.pdf", download: "Chapter-5 Import and Export Procedure.pdf" },
      { title: "Chapter-6 Baggage", src: "/pdf/indirecttax/customsact/Chapter-6 Baggage.pdf", download: "Chapter-6 Baggage.pdf" },
      { title: "Chapter 7 - Appeals under Customs", src: "/pdf/indirecttax/customsact/Chapter-7 Appeals under Customs.pdf", download: "Chapter-7 Appeals under Customs.pdf" },
      { title: "Chapter 8 - Appeal to Commissioner", src: "/pdf/indirecttax/customsact/Chapter-8 Appeal to Commissioner (Appeal).pdf", download: "Chapter-8 Appeal to Commissioner (Appeal).pdf" },
      { title: "Chapter 9 - Appeals to CESTAT", src: "/pdf/indirecttax/customsact/Chapter-9 Appeals to the Customs, Excise and Service Tax Appellate Tribunal (CESTAT).pdf", download: "Chapter-9 Appeals to the Customs, Excise and Service Tax Appellate Tribunal (CESTAT).pdf" },
      { title: "Chapter 10 - Appeals to High Court", src: "/pdf/indirecttax/customsact/Chapter-10 Appeals to High Court.pdf", download: "Chapter-10 Appeals to High Court.pdf" },
      { title: "Chapter-12 Appeals to the Settlement Commission", src: "/pdf/indirecttax/customsact/Chapter-12 Appeals to the Settlement Commission.pdf", download: "Chapter-12 Appeals to the Settlement Commission.pdf" },
      { title: "Chapter-13 Authority for Advance Ruling", src: "/pdf/indirecttax/customsact/Chapter-13 Authority for Advance Ruling.pdf", download: "Chapter-13 Authority for Advance Ruling.pdf" },
      { title: "Chapter-14 Foreign Trade Policy 2015-2020", src: "/pdf/indirecttax/customsact/Chapter-14 Foreign Trade Policy 2015-2020.pdf", download: "Chapter-14 Foreign Trade Policy 2015-2020.pdf" },
      { title: "Chapter-15 Comprehensive Issues under Customs", src: "/pdf/indirecttax/customsact/Chapter-15 Comprehensive Issues under Customs.pdf", download: "Chapter-15 Comprehensive Issues under Customs.pdf" },
    ],
  };

  const handlePDFClick = (pdf: PDFCard) => {
    setSelectedPDF(pdf);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPDF(null);
    setShowModal(false);
  };

  const toggleConcept = (concept: string) => {
    setSelectedConcept((prev) => (prev === concept ? "" : concept));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm sm:text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 flex-shrink-0">
              <Image
                src={indirecttax}
                alt="Indirect Taxation Laws and Compliance"
                width={300}
                height={200}
                className="w-full h-48 object-cover md:h-full md:w-full"
                priority
              />
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
              <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Indirect Taxation Laws and Compliance
              </h1>
              
            </div>
            
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {Object.entries(conceptPDFs).map(([concept, pdfs]) => (
            <div key={concept} className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={() => toggleConcept(concept)}
                className="w-full flex items-center justify-between text-left hover:text-blue-600 transition-colors focus:outline-none"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pr-4">
                  {concept}
                </h3>
                {selectedConcept === concept ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                )}
              </button>

              {selectedConcept === concept && (
                <div className="mt-4 space-y-3">
                  {pdfs.map((pdf, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-700 text-sm sm:text-base flex-grow pr-2 line-clamp-2">
                        {pdf.title}
                      </span>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => handlePDFClick(pdf)}
                          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                          View
                        </button>
                        <a
                          href={pdf.src}
                          download={pdf.download}
                          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedPDF && (
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-70">
          <div className="relative w-full h-full flex flex-col bg-white">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
            
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedPDF.src}
                className="w-full h-full border-0"
                title={selectedPDF.title}
                allowFullScreen
                style={{ display: "block" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}