"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
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
}

interface ConceptPDFs {
  [key: string]: PDFCard[];
}

export default function BusinessRegulatoryPage() {
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
    "Advising on Setting Up a Business": [
      { title: "Chapter-01 Choice of Business Organizations", src: "/pdf/bussiness/advising/Choice of Business Organisation.pdf", download: "Choice of Business Organisation.pdf" },
      { title: "Chapter-02 Types of Companies", src: "/pdf/bussiness/advising/Types of Companies.pdf", download: "Types of Companies.pdf" },
      { title: "Chapter-03 Charter Documents of companies", src: "/pdf/bussiness/advising/Charter Documents of companies.pdf", download: "Charter Documents of companies.pdf" },
      { title: "Chapter-04 Legal status of the registered company", src: "/pdf/bussiness/advising/Legal status of the registered company.pdf", download: "Legal status of the registered company.pdf" },
      { title: "Chapter-05 Formation of LLP", src: "/pdf/bussiness/advising/Fomation of LLP.pdf", download: "Fomation of LLP.pdf" },
      { title: "Chapter-06 Different forms of business organisations and it's registration", src: "/pdf/bussiness/advising/Different forms of business organisations and it's registration.pdf", download: "Different forms of business organisations and it's registration.pdf" },
      { title: "Chapter-07 Formation and registration of NGO's", src: "/pdf/bussiness/advising/Formation and registration of NGOs.pdf", download: "Formation and registration of NGOs.pdf" },
      { title: "Chapter-08 Financial Services Organisation and its registrations", src: "/pdf/bussiness/advising/Financial Services Organisation and its registrations.pdf", download: "Financial Services Organisation and its registrations.pdf" },
      { title: "Chapter-09 Startups and it's registrations", src: "/pdf/bussiness/advising/Startups and it's registrations.pdf", download: "Startups and it's registrations.pdf" },
      { title: "Chapter-10 Business Collaborations", src: "/pdf/bussiness/advising/Business Collaborations.pdf", download: "Business Collaborations.pdf" },
      { title: "Chapter-11 Setting up of Business outside India and Issues (2)", src: "/pdf/bussiness/advising/Setting up of Business outside India and Issues (2).pdf", download: "Setting up of Business outside India and Issues (2).pdf" },
      { title: "Chapter-12 Conversion of Business Entities", src: "/pdf/bussiness/advising/Conversion of  Business Entities.pdf", download: "Conversion of Business Entities.pdf" },
    ],
    "Business Maintenance": [
      { title: "Chapter-14 Maintenance of Registers and Records", src: "/pdf/bussiness/bussinessmaintaince/Maintenance of Registers and Records.pdf", download: "Maintenance of Registers and Records.pdf" },
      { title: "Chapter-15 Identifying laws applicable to Various Industries and their compliances", src: "/pdf/bussiness/bussinessmaintaince/Identifying laws applicable to Various Industries and their compliances.pdf", download: "Identifying laws applicable to Various Industries and their compliances.pdf" },
      { title: "Chapter-17 Compliance's under labour Laws", src: "/pdf/bussiness/bussinessmaintaince/Compliance's under labour Laws.pdf", download: "Compliance's under labour Laws.pdf" },
      { title: "Chapter-18 Compliance's relating to environmental laws", src: "/pdf/bussiness/bussinessmaintaince/Compliance's relating to environmental laws.pdf", download: "Compliance's relating to environmental laws.pdf" },
    ],
    "Procedure to Close a Business": [
      { title: "Chapter-19 Dormant Company", src: "/pdf/bussiness/procedure/Dormant Company.pdf", download: "Dormant Company.pdf" },
      { title: "Chapter-20 Strike off and Restoration of Name of Co and LLP", src: "/pdf/bussiness/procedure/Strike off and Restoration of Name of Co and LLP.pdf", download: "Strike off and Restoration of Name of Co and LLP.pdf" },
      { title: "Chapter-21 Corporate Insolvency Resolution Process, Liquidation & Winding Up - An Overview", src: "/pdf/bussiness/procedure/Corporate Insolvency Resolution Process,Liquidation &.winding up_ An Overview.pdf", download: "Corporate Insolvency Resolution Process,Liquidation &.winding up_ An Overview.pdf" },
    ],
    "Appendix of Lessons": [
      { title: "Lesson-01 INDIAN CONTRACT ACT, 1872", src: "/pdf/bussiness/appendix/INDIAN CONTRACT ACT, 1872.pdf", download: "INDIAN CONTRACT ACT, 1872.pdf" },
      { title: "Lesson-02 SPECIFIC RELIEF ACT, 1963", src: "/pdf/bussiness/appendix/SPECIFIC RELIEF ACT, 1963.pdf", download: "SPECIFIC RELIEF ACT, 1963.pdf" },
      { title: "Lesson-03 SALE OF GOODS ACT, 1930", src: "/pdf/bussiness/appendix/SALE OF GOODS ACT, 1930.pdf", download: "SALE OF GOODS ACT, 1930.pdf" },
      { title: "Lesson-04 NEGOTIABLE INSTRUMENT ACT, 1881", src: "/pdf/bussiness/appendix/NEGOTIABLE INSTRUMENT ACT, 1881.pdf", download: "NEGOTIABLE INSTRUMENT ACT, 1881.pdf" },
      { title: "Lesson-05 INTERPRETATION OF STATUTES", src: "/pdf/bussiness/appendix/INTERPRETATION OF STATUTES.pdf", download: "INTERPRETATION OF STATUTES.pdf" },
      { title: "Lesson-06 INDIAN STAMP ACT, 1899", src: "/pdf/bussiness/appendix/INDIAN STAMP ACT, 1899.pdf", download: "INDIAN STAMP ACT, 1899.pdf" },
      { title: "Lesson-07 ARBITRATION AND CONCILIATION ACT, 1996", src: "/pdf/bussiness/appendix/ARBITRATION AND CONCILIATION ACT, 1996.pdf", download: "ARBITRATION AND CONCILIATION ACT, 1996.pdf" },
      { title: "Lesson-08 TYPES OF BUSINESS ENTITIES", src: "/pdf/bussiness/appendix/TYPES OF BUSINESS ENTITIES.pdf", download: "TYPES OF BUSINESS ENTITIES.pdf" },
      { title: "Lesson-09 PUBLIC SECTOR ENTITIES", src: "/pdf/bussiness/appendix/PUBLIC SECTOR ENTITIES.pdf", download: "PUBLIC SECTOR ENTITIES.pdf" },
      { title: "Lesson-10 SHOP AND ESTABLISHMENT ACT, 1948", src: "/pdf/bussiness/appendix/SHOP AND ESTABLISHMENT ACT, 1948.pdf", download: "SHOP AND ESTABLISHMENT ACT, 1948.pdf" },
      { title: "Lesson-11 COMPANIES ACT, 2013", src: "/pdf/bussiness/appendix/COMPANIES ACT, 2013.pdf", download: "COMPANIES ACT, 2013.pdf" },
      { title: "Lesson-12 LIMITED LIABILITY PARTNERSHIP ACT, 2008", src: "/pdf/bussiness/appendix/LIMITED LIABILITY PARTNERSHIP ACT, 2008.pdf", download: "LIMITED LIABILITY PARTNERSHIP ACT, 2008.pdf" },
      { title: "Lesson-13 PARTNERSHIP ACT, 1932", src: "/pdf/bussiness/appendix/PARTNERSHIP ACT, 1932.pdf", download: "PARTNERSHIP ACT, 1932.pdf" },
      { title: "Lesson-14 INDIAN TRUST ACT, 1882", src: "/pdf/bussiness/appendix/INDIAN TRUST ACT, 1882.pdf", download: "INDIAN TRUST ACT, 1882.pdf" },
      { title: "Lesson-15 SOCIETIES REGISTRATION ACT, 1860", src: "/pdf/bussiness/appendix/SOCIETIES REGISTRATION ACT, 1860.pdf", download: "SOCIETIES REGISTRATION ACT, 1860.pdf" },
      { title: "Lesson-17 MULTI-STATE CO-OPERATIVE SOCIETIES ACT, 2002", src: "/pdf/bussiness/appendix/MULTI-STATE CO-OPERATIVE SOCIETIES ACT, 2002.pdf", download: "MULTI-STATE CO-OPERATIVE SOCIETIES ACT, 2002.pdf" },
      { title: "Lesson-18 PROFESSION TAX", src: "/pdf/bussiness/appendix/PROFESSION TAX.pdf", download: "PROFESSION TAX.pdf" },
      { title: "Lesson-19 EMPLOYEE STATE INSURANCE ACT, 1948", src: "/pdf/bussiness/appendix/EMPLOYEE STATE INSURANCE ACT, 1948.pdf", download: "EMPLOYEE STATE INSURANCE ACT, 1948.pdf" },
      { title: "Lesson-20 EPF AND MISC. PROVISIONS ACT, 1952", src: "/pdf/bussiness/appendix/EPF AND MISC. PROVISIONS ACT, 1952.pdf", download: "EPF AND MISC. PROVISIONS ACT, 1952.pdf" },
      { title: "Lesson-21 PAYMENT OF GRATUITY ACT, 1972", src: "/pdf/bussiness/appendix/PAYMENT OF GRATUITY ACT, 1972.pdf", download: "PAYMENT OF GRATUITY ACT, 1972.pdf" },
      { title: "Lesson-22 FACTORIES ACT, 1948", src: "/pdf/bussiness/appendix/FACTORIES ACT, 1948.pdf", download: "FACTORIES ACT, 1948.pdf" },
      { title: "Lesson-23 PAYMENT OF WAGES ACT, 1936", src: "/pdf/bussiness/appendix/PAYMENT OF WAGES ACT, 1936.pdf", download: "PAYMENT OF WAGES ACT, 1936.pdf" },
      { title: "Lesson-24 MINIMUM WAGES ACT, 1948", src: "/pdf/bussiness/appendix/MINIMUM WAGES ACT, 1948.pdf", download: "MINIMUM WAGES ACT, 1948.pdf" },
      { title: "Lesson-25 PAYMENT OF BONUS ACT, 1965", src: "/pdf/bussiness/appendix/PAYMENT OF BONUS ACT, 1965.pdf", download: "PAYMENT OF BONUS ACT, 1965.pdf" },
      { title: "OTHER MAJOR LAWS", src: "/pdf/bussiness/appendix/OTHER MAJOR LAWS.pdf", download: "OTHER MAJOR LAWS.pdf" },
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
                src={complaince}
                alt="Business Regulatory Framework"
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
                Business Regulatory Laws Compliance
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-4 max-w-[70%]">
                {selectedPDF.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
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