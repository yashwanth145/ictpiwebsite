"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import appliedfinance from "../../../assets/fourthimage.webp";
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

export default function AppliedFinancePage() {
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
    "Chapter-1 Meaning and Scope of Accounting": [
      { title: "Chapter 1.1 - Accounting Assumptions and Concepts", src: "/pdf/appliedfinance/chapter1/Accounting Assumptions and Concepts.pdf", download: "Accounting Assumptions and Concepts.pdf" },
      { title: "Chapter 1.2 - Preliminaries", src: "/pdf/appliedfinance/chapter1/Preliminaries.pdf", download: "Preliminaries.pdf" },
      { title: "Chapter 1.3 - Other Related Matters", src: "/pdf/appliedfinance/chapter1/Other Related Matters.pdf", download: "Other Related Matters.pdf" },
    ],
    "Chapter-2 Accounting process-Basics and Journal": [
      { title: "Chapter 2.1 - 2A Journal", src: "/pdf/appliedfinance/chapter2/2A Journal.pdf", download: "2A Journal.pdf" },
      { title: "Chapter 2.2 - 2B Ledger", src: "/pdf/appliedfinance/chapter2/2B Ledger.pdf", download: "2B Ledger.pdf" },
      { title: "Chapter 2.3 - 2C Trial Balance", src: "/pdf/appliedfinance/chapter2/2C Trial Balance.pdf", download: "2C Trial Balance.pdf" },
      { title: "Chapter 2.4 - 2D Subsidiary Books", src: "/pdf/appliedfinance/chapter2/2D Subsidiary Books.pdf", download: "2D Subsidiary Books.pdf" },
      { title: "Chapter 2.5 - 2E Cash Books", src: "/pdf/appliedfinance/chapter2/2E Cash Books.pdf", download: "2E Cash Books.pdf" },
      { title: "Chapter 2.6 - 2F Capital vs Revenue", src: "/pdf/appliedfinance/chapter2/2F Capital vs Revenue.pdf", download: "2F Capital vs Revenue.pdf" },
      { title: "Chapter 2.7 - 2G Contingent Asset and Liabilities", src: "/pdf/appliedfinance/chapter2/2G Contingent Asset and Liabilities.pdf", download: "2G Contingent Asset and Liabilities.pdf" },
    ],
    "Chapter-3 Rectification of Errors": [
      { title: "Chapter 3 - Rectification of Errors", src: "/pdf/appliedfinance/chapter3/Rectification of Errors.pdf", download: "Rectification of Errors.pdf" },
    ],
    "Chapter-4 Bank Reconciliation Statement": [
      { title: "Chapter 4 - Bank Reconciliation Statement", src: "/pdf/appliedfinance/chapter4/Bank Reconciliation Statement.pdf", download: "Bank Reconciliation Statement.pdf" },
    ],
    "Chapter-5 Inventories": [
      { title: "Chapter 5.1 - Inventories Basics", src: "/pdf/appliedfinance/chapter5/Inventories- Basics.pdf", download: "Inventories- Basics.pdf" },
      { title: "Chapter 5.2 - Inventory Systems", src: "/pdf/appliedfinance/chapter5/Inventory Systems.pdf", download: "Inventory Systems.pdf" },
      { title: "Chapter 5.3 - Techniques & Formula for Inventory Variation", src: "/pdf/appliedfinance/chapter5/Techniques_ Formula for Inventory Variation.pdf", download: "Techniques_ Formula for Inventory Variation.pdf" },
    ],
    "Chapter-6 Depriciation": [
      { title: "Chapter 6.1 - Basic Terms of Depreciation", src: "/pdf/appliedfinance/chapter6/Basic Terms.pdf", download: "Basic Terms.pdf" },
      { title: "Chapter 6.2 - Methods of Depreciation", src: "/pdf/appliedfinance/chapter6/Methods of Depreciation.pdf", download: "Methods of Depreciation.pdf" },
      { title: "Chapter 6.3 - Related Matters", src: "/pdf/appliedfinance/chapter6/Related Matters.pdf", download: "Related Matters.pdf" },
    ],
    "Chapter-7 Accounting for Spcial Transactions": [
      { title: "Chapter 7.1 - Account Current", src: "/pdf/appliedfinance/chapter7/Account Current.pdf", download: "Account Current.pdf" },
      { title: "Chapter 7.2 - Average Due Date", src: "/pdf/appliedfinance/chapter7/Average Due Date.pdf", download: "Average Due Date.pdf" },
      { title: "Chapter 7.3 - Bills of Exchange", src: "/pdf/appliedfinance/chapter7/Bills of Exchange.pdf", download: "Bills of Exchange.pdf" },
      { title: "Chapter 7.4 - Consignment", src: "/pdf/appliedfinance/chapter7/Consignment.pdf", download: "Consignment.pdf" },
      { title: "Chapter 7.5 - Sales on Approval or Return Basis", src: "/pdf/appliedfinance/chapter7/Sales on Approval or Return Basis.pdf", download: "Sales on Approval or Return Basis.pdf" },
    ],
    "Chapter-8 Financial Statement -Final Accounts of Sole Proprietorship Entities": [
      { title: "Chapter 8.1 - Adjustments", src: "/pdf/appliedfinance/chapter8/Adjustments.pdf", download: "Adjustments.pdf" },
      { title: "Chapter 8.2 - Balance Sheet", src: "/pdf/appliedfinance/chapter8/Balance Sheet.pdf", download: "Balance Sheet.pdf" },
      { title: "Chapter 8.3 - Financial Statement", src: "/pdf/appliedfinance/chapter8/Financial Statement.pdf", download: "Financial Statement.pdf" },
      { title: "Chapter 8.4 - Manufacturing Account", src: "/pdf/appliedfinance/chapter8/Manufacturing Account.pdf", download: "Manufacturing Account.pdf" },
      { title: "Chapter 8.5 - Profit and Loss Account", src: "/pdf/appliedfinance/chapter8/Profit and Loss Account.pdf", download: "Profit and Loss Account.pdf" },
      { title: "Chapter 8.6 - Trading Account", src: "/pdf/appliedfinance/chapter8/Trading Account.pdf", download: "Trading Account.pdf" },
    ],
    "Chapter-9 Accounting for partnership firms": [
      { title: "Chapter 9.1 - Admission of New Partner", src: "/pdf/appliedfinance/chapter9/Admission of New Partner.pdf", download: "Admission of New Partner.pdf" },
      { title: "Chapter 9.2 - Goodwill", src: "/pdf/appliedfinance/chapter9/Goodwill.pdf", download: "Goodwill.pdf" },
      { title: "Chapter 9.3 - Partnership Basics", src: "/pdf/appliedfinance/chapter9/Partnership Basics.pdf", download: "Partnership Basics.pdf" },
      { title: "Chapter 9.4 - Retirement and Death", src: "/pdf/appliedfinance/chapter9/Retirement and Death.pdf", download: "Retirement and Death.pdf" },
    ],
    "Chapter-10 Accounting For Not -For-Profit and Educational Organisations": [
      { title: "Chapter 10 - Accounting For Not-For-Profit and Educational Organisations", src: "/pdf/appliedfinance/chapter10/Accounting For Not -For-Profit and Educational Organisations.pdf", download: "Accounting For Not -For-Profit and Educational Organisations.pdf" },
    ],
    "Chapter-11 Accounting For Companices": [
      { title: "Chapter 11.1 - Company Basics", src: "/pdf/appliedfinance/chapter11/Company Basics.pdf", download: "Company Basics.pdf" },
      { title: "Chapter 11.2 - Financial Statement", src: "/pdf/appliedfinance/chapter11/Financial Statement.pdf", download: "Financial Statement.pdf" },
      { title: "Chapter 11.3 - Preferences Shares", src: "/pdf/appliedfinance/chapter11/Preferences Shares.pdf", download: "Preferences Shares.pdf" },
      { title: "Chapter 11.4 - Debentures", src: "/pdf/appliedfinance/chapter11/Debentures.pdf", download: "Debentures.pdf" },
      { title: "Chapter 11.5 - Shares- Issue, Forfeiture and Re- Issues", src: "/pdf/appliedfinance/chapter11/Shares- Issue, Forfeiture and Re- Issues.pdf", download: "Shares- Issue, Forfeiture and Re- Issues.pdf" },
    ],
    "Chapter-12 Accounting standards": [
      { title: "Chapter 12.1 - Basic Accounting Standard", src: "/pdf/appliedfinance/chapter12/Basic Accounting Standard.pdf", download: "Basic Accounting Standard.pdf" },
      { title: "Chapter 12.2 - Framework for Financial Statements", src: "/pdf/appliedfinance/chapter12/Framework for Preparation and Presentation of Financial Statements.pdf", download: "Framework for Preparation and Presentation of Financial Statements.pdf" },
      { title: "Chapter 12.3 - Introduction to Accounting Standards", src: "/pdf/appliedfinance/chapter12/Introduction to Accounting Standards.pdf", download: "Introduction to Accounting Standards.pdf" },
      { title: "Chapter 12.4 - Overview of Accounting Standards", src: "/pdf/appliedfinance/chapter12/Overview of Accounting Standards.pdf", download: "Overview of Accounting Standards.pdf" },
      { title: "Chapter 12.5 - Application of Accounting Standards", src: "/pdf/appliedfinance/chapter12/Application of Accounting Standards.pdf", download: "Application of Accounting Standards.pdf" },
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
                src={appliedfinance}
                alt="Applied Finance"
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
                Applied Finance Accounting and Ethics
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