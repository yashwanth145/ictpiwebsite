"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { X, ArrowLeft, ChevronDown, ChevronUp, Download } from "lucide-react";
import Image from "next/image";
import directtaxImg from "../../../assets/directtax.webp";
import "../../globals.css";

// === TYPE DEFINITIONS ===
interface AuthUser {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

interface PDFCard {
  title: string;
  src: string;
  download: string;
}

type Section = PDFCard[];
type Category = Record<string, Record<string, Section>>;

// === CLEANED & DEDUPLICATED PDF DATA ===
const pdfData: Category = {
  Domestic: {
    "Basic Concepts, Computation of Income Tax and Filing of Return": [
      { title: "Basic Concepts of IT", src: "/pdf/directtax/domestic/Basic Concepts of IT.pdf", download: "Basic_Concepts_of_IT.pdf" },
      { title: "Tax Rates", src: "/pdf/directtax/domestic/Tax Rates.pdf", download: "Tax_Rates.pdf" },
      { title: "Income Which do not form Part total income", src: "/pdf/directtax/domestic/Income Which do not form Part total income.pdf", download: "Exempt_Income.pdf" },
      { title: "Income from Salaries", src: "/pdf/directtax/domestic/Income from Salaries.pdf", download: "Income_from_Salaries.pdf" },
      { title: "Income from House Property", src: "/pdf/directtax/domestic/Income from House Property.pdf", download: "Income_from_House_Property.pdf" },
      { title: "Income from Capital Gains", src: "/pdf/directtax/domestic/Income from Capital Gains.pdf", download: "Capital_Gains.pdf" },
      { title: "Clubbing of Income", src: "/pdf/directtax/domestic/Clubbing of Income.pdf", download: "Clubbing_of_Income.pdf" },
      { title: "Set off and carry forward of losses", src: "/pdf/directtax/domestic/Set off and carry forward of losses.pdf", download: "Set_off_losses.pdf" },
      { title: "Advance Tax Calculations", src: "/pdf/directtax/domestic/Advance Tax Calculations.pdf", download: "Advance_Tax.pdf" },
      { title: "Deductions Under Chapter VI A", src: "/pdf/directtax/domestic/Deductions Under Chapter VI A.pdf", download: "Deductions_Chapter_VIA.pdf" },
      { title: "Calculation of Interest on Late Payments u/s 234", src: "/pdf/directtax/domestic/Calculation of Interest on Late Payments u-s 234.pdf", download: "Late_Payment_Interest.pdf" },
      { title: "TDS and TCS Provisions", src: "/pdf/directtax/domestic/TDS and TCS Provisions.pdf", download: "TDS_TCS.pdf" },
      { title: "Updated Return Filing", src: "/pdf/directtax/domestic/Updated Return Filing.pdf", download: "Updated_Return.pdf" },
    ],
    "Special Provisions Regarding Capital Gains and Other Important Topics": [
      { title: "Tax on Dividend Received from Foreign Company", src: "/pdf/directtax/domestic/Tax on Dividend Received from Foreign Company.pdf", download: "Foreign_Dividend_Tax.pdf" },
      { title: "Bonus Stripping on Units", src: "/pdf/directtax/domestic/Bonus Stripping on Units.pdf", download: "Bonus_Stripping.pdf" },
      { title: "Bond Washing Transactions", src: "/pdf/directtax/domestic/Bond Washing Transactions.pdf", download: "Bond_Washing.pdf" },
      { title: "Buy Back of Shares", src: "/pdf/directtax/domestic/Buy Back of Shares.pdf", download: "Buyback_Shares.pdf" },
      { title: "Taxation of Employees Stock Options", src: "/pdf/directtax/domestic/Taxation of Employees Stock Options.pdf", download: "ESOP_Taxation.pdf" },
      { title: "TDS and Tax Payment on ESOP's", src: "/pdf/directtax/domestic/TDS and Tax Payment on ESOPs.pdf", download: "ESOP_TDS.pdf" },
      { title: "Taxation of income on units", src: "/pdf/directtax/domestic/Taxation of income on units.pdf", download: "Unit_Income_Tax.pdf" },
    ],
    "Taxation of different entities and related special provisions": [
      { title: "Special Taxation Regime on Individual and HUF and Cooperatives", src: "/pdf/directtax/domestic/Special Taxation Regime on Individual and HUF and Cooperatives.pdf", download: "Special_Tax_Regime_Individual_HUF.pdf" },
      { title: "Taxation of HUF's", src: "/pdf/directtax/domestic/Taxation of HUFs.pdf", download: "HUF_Taxation.pdf" },
      { title: "Taxation of Firms", src: "/pdf/directtax/domestic/Taxation of Firms.pdf", download: "Firms_Taxation.pdf" },
      { title: "Taxation of LLP", src: "/pdf/directtax/domestic/Taxation of LLP.pdf", download: "LLP_Taxation.pdf" },
      { title: "Alternate Minimum Tax", src: "/pdf/directtax/domestic/Alternate Minimum Tax.pdf", download: "AMT.pdf" },
      { title: "Taxation of Agricultural Income", src: "/pdf/directtax/domestic/Taxation of Agricultural Income.pdf", download: "Agricultural_Income.pdf" },
      { title: "Tonnage Taxation", src: "/pdf/directtax/domestic/Tonnage Taxation.pdf", download: "Tonnage_Tax.pdf" },
      { title: "Special Taxation regime for Companies 115BAA and 115BAB", src: "/pdf/directtax/domestic/Special Taxation regime for Companies 115BAA and 115BAB.pdf", download: "Companies_Special_Tax_Regime.pdf" },
      { title: "Minimum Alternate Tax on Companies", src: "/pdf/directtax/domestic/Minimum Alternate Tax on Companies.pdf", download: "MAT_Companies.pdf" },
      { title: "Amalgamation and it tax implications", src: "/pdf/directtax/domestic/Amalgamation and it tax implications.pdf", download: "Amalgamation_Tax.pdf" },
      { title: "Demerger and it's tax implications", src: "/pdf/directtax/domestic/Demerger and its tax implications.pdf", download: "Demerger_Tax.pdf" },
      { title: "Liquidation of Companies", src: "/pdf/directtax/domestic/Liquidation of Companies.pdf", download: "Liquidation.pdf" },
      { title: "Taxation of Dividends and liquidation of Companies", src: "/pdf/directtax/domestic/Taxation of Dividends and liquidation of Companies.pdf", download: "Dividend_Liquidation_Tax.pdf" },
      { title: "Business Reorganisation of Co-op Banks", src: "/pdf/directtax/domestic/Business Reorganisation of Co-op Banks.pdf", download: "Coop_Bank_Reorganisation.pdf" },
      { title: "Principal of Mutuality", src: "/pdf/directtax/domestic/Principal of Mutuality.pdf", download: "Mutuality_Principle.pdf" },
      { title: "special provisions of Tax on accrued income of trusts and Institutions", src: "/pdf/directtax/domestic/Special provisions of Tax on accrued income of trusts and Institutions.pdf", download: "Trust_Income_Tax.pdf" },
      { title: "Taxation of Business Trust and unit holders", src: "/pdf/directtax/domestic/Taxation of Business Trust and unit holders.pdf", download: "Business_Trust_Tax.pdf" },
      { title: "Taxation of securitization trust and its investors", src: "/pdf/directtax/domestic/Taxation of securitization trust and its investors.pdf", download: "Securitization_Trust_Tax.pdf" },
      { title: "Taxation of Political Parties", src: "/pdf/directtax/domestic/Taxation of Political Parties.pdf", download: "Political_Party_Tax.pdf" },
      { title: "Taxation of Electoral Trusts", src: "/pdf/directtax/domestic/Taxation of Electoral Trusts.pdf", download: "Electoral_Trust_Tax.pdf" },
      { title: "Exempt income stripping", src: "/pdf/directtax/domestic/Exempt income stripping.pdf", download: "Exempt_Income_Strip.pdf" },
      { title: "New Pension Scheme", src: "/pdf/directtax/domestic/New Pension Scheme.pdf", download: "New_Pension_Scheme.pdf" },
      { title: "Tax on Income from Patents", src: "/pdf/directtax/domestic/Tax on Income from Patents.pdf", download: "Patent_Income_Tax.pdf" },
      { title: "Taxation of Crypto Currency", src: "/pdf/directtax/domestic/Taxation of Crypto Currency.pdf", download: "Crypto_Tax.pdf" },
      { title: "Taxation of ULIP's", src: "/pdf/directtax/domestic/Taxation of ULIPs.pdf", download: "ULIP_Tax.pdf" },
      { title: "Taxation of Investment Fund and it's investors", src: "/pdf/directtax/domestic/Taxation of Investment Fund and its investors.pdf", download: "Investment_Fund_Tax.pdf" },
      { title: "Representative Assessee", src: "/pdf/directtax/domestic/Representative Assessee.pdf", download: "Representative_Assessee.pdf" },
      { title: "AIS", src: "/pdf/directtax/domestic/AIS.pdf", download: "AIS.pdf" },
      { title: "SFTA", src: "/pdf/directtax/domestic/SFTA.pdf", download: "SFTA.pdf" },
      { title: "Prescribed Electronic Modes of Payment", src: "/pdf/directtax/domestic/Prescribed Electronic Modes of Payment.pdf", download: "Electronic_Payment_Modes.pdf" },
    ],
    "Tax assessments and related provisions": [
      { title: "Tax Assessment Procedure", src: "/pdf/directtax/domestic/Tax Assessment Procedure.pdf", download: "Assessment_Procedure.pdf" },
      { title: "Tax Authorities, Survey and Summons", src: "/pdf/directtax/domestic/Tax Authorities, Survey and Summons.pdf", download: "Tax_Authorities.pdf" },
      { title: "Search and Seizure", src: "/pdf/directtax/domestic/Search and Seizure.pdf", download: "Search_Seizure.pdf" },
      { title: "Faceless Appeals", src: "/pdf/directtax/domestic/Faceless Appeals.pdf", download: "Faceless_Appeals.pdf" },
      { title: "Avoidance of Repetitive Appeals", src: "/pdf/directtax/domestic/Avoidance of Repetitive Appeals.pdf", download: "Avoid_Repetitive_Appeals.pdf" },
      { title: "Concepts on Assessments Appeals", src: "/pdf/directtax/domestic/Concepts on Assessments Appeals.pdf", download: "Assessment_Appeals.pdf" },
      { title: "Dispute Resolution Committee", src: "/pdf/directtax/domestic/Dispute Resolution Committee.pdf", download: "Dispute_Resolution.pdf" },
      { title: "Assessee in Default", src: "/pdf/directtax/domestic/Assessee in Default.pdf", download: "Default_Assessee.pdf" },
      { title: "Penalties and prosecutions", src: "/pdf/directtax/domestic/Penalties and prosecutions.pdf", download: "Penalties_Prosecutions.pdf" },
      { title: "Tax Planning, avoidance and evasion", src: "/pdf/directtax/domestic/Tax Planning, avoidance and evasion.pdf", download: "Tax_Planning.pdf" },
      { title: "Misc Amendments by FA 2022", src: "/pdf/directtax/domestic/Misc Amendments by FA 2022.pdf", download: "FA_2022_Amendments.pdf" },
    ],
  },
  International: {
    "International Taxation": [
      { title: "Advance Rulings", src: "/pdf/directtax/international/Advance Rulings.pdf", download: "Advance_Rulings.pdf" },
      { title: "Business Connections", src: "/pdf/directtax/international/Business Connections.pdf", download: "Business_Connections.pdf" },
      { title: "Calculation of Interest on Late Payment u_s 234", src: "/pdf/directtax/international/Calculation of Interest on Late Payment u_s 234.pdf", download: "Late_Payment_Interest_International.pdf" },
      { title: "Convert of Indian branch of foreign bank into a subsidiary co.", src: "/pdf/directtax/international/Convert of Indian branch of foreign bank into a subsidiary co..pdf", download: "Foreign_Bank_Conversion.pdf" },
      { title: "Determination of Residential Status", src: "/pdf/directtax/international/Determination of Residential Status.pdf", download: "Residential_Status.pdf" },
      { title: "Double Taxation Avoidance Agreement (DTAA)", src: "/pdf/directtax/international/Double Taxation Avoidance Agreement (DTAA).pdf", download: "DTAA.pdf" },
      { title: "Equalisation Levy", src: "/pdf/directtax/international/Equalisation Levy.pdf", download: "Equalisation_Levy.pdf" },
      { title: "Exempt incomes of Non residents", src: "/pdf/directtax/international/Exempt incomes of Non residents.pdf", download: "Non_Resident_Exempt_Income.pdf" },
      { title: "Exemption of specified incomes", src: "/pdf/directtax/international/Exemption of specified incomes.pdf", download: "Specified_Income_Exemption.pdf" },
      { title: "Foreign tax credit", src: "/pdf/directtax/international/Foreign tax credit.pdf", download: "Foreign_Tax_Credit.pdf" },
      { title: "Fund Managers of Offshore funds", src: "/pdf/directtax/international/Fund Managers of Offshore funds.pdf", download: "Offshore_Fund_Managers.pdf" },
      { title: "General Anti Avoidance Rules", src: "/pdf/directtax/international/General Anti Avoidance Rules.pdf", download: "GAAR.pdf" },
      { title: "Important Question on International Taxation", src: "/pdf/directtax/international/Important Question on International Taxation.pdf", download: "International_Tax_Questions.pdf" },
      { title: "Miscellaneous Amendments by FA 2022", src: "/pdf/directtax/international/Miscellaneous Amendments by FA 2022.pdf", download: "FA_2022_International_Amendments.pdf" },
      { title: "Notified Jurisdictional Area", src: "/pdf/directtax/international/Notified Jurisdictional Area.pdf", download: "Notified_Jurisdiction.pdf" },
      { title: "Relocation to IFSC", src: "/pdf/directtax/international/Relocation to IFSC.pdf", download: "IFSC_Relocation.pdf" },
      { title: "Safe Harbour Rules", src: "/pdf/directtax/international/Safe Harbour Rules.pdf", download: "Safe_Harbour_Rules.pdf" },
      { title: "Special Provisions of Rupee denominated banks", src: "/pdf/directtax/international/Special Provisions of Rupee denominated banks.pdf", download: "Rupee_Denominated_Banks.pdf" },
      { title: "Taxability of royalty, fee for technical services and interest", src: "/pdf/directtax/international/Taxability of royalty, fee for technical services and interest.pdf", download: "Royalty_FTS_Interest_Tax.pdf" },
      { title: "Transfer Pricing", src: "/pdf/directtax/international/Transfer Pricing.pdf", download: "Transfer_Pricing.pdf" },
    ],
  },
};

export default function DirectTaxPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);

  const [openTop, setOpenTop] = useState<{ Domestic?: boolean; International?: boolean }>({
    Domestic: false,
    International: false,
  });

  const [openSub, setOpenSub] = useState<Record<string, boolean>>({});

  useEffect(() => setMounted(true), []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!auth || auth.loading || !mounted) return;
    if (!auth.user) router.push("/");
  }, [auth, router, mounted]);

  // === FULLSCREEN LOGIC (TYPE-SAFE & BROWSER COMPATIBLE) ===
  useEffect(() => {
    if (!showModal || !fullscreenRef.current) return;

    const el = fullscreenRef.current;

    const enterFullscreen = () => {
      if (!el || document.fullscreenElement) return;

      if ("requestFullscreen" in el) {
        (el.requestFullscreen as () => Promise<void>)();
      } else if ("webkitRequestFullscreen" in el) {
        (el as any).webkitRequestFullscreen();
      } else if ("msRequestFullscreen" in el) {
        (el as any).msRequestFullscreen();
      }
    };

    enterFullscreen();

    const handleFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement;

      if (!isFullscreen) {
        handleCloseModal();
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };

    const events = ["fullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"] as const;
    events.forEach((event) => document.addEventListener(event, handleFullscreenChange));
    window.addEventListener("keydown", handleEsc);

    return () => {
      events.forEach((event) => document.removeEventListener(event, handleFullscreenChange));
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showModal]);

  if (!mounted || !auth || auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  const handlePDFClick = (pdf: PDFCard) => {
    setSelectedPDF(pdf);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPDF(null);
    setShowModal(false);

    const exit =
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).msExitFullscreen ||
      (document as any).mozCancelFullScreen;

    if (exit && document.fullscreenElement) {
      exit.call(document);
    }
  };

  const toggleTop = (key: "Domestic" | "International") => {
    setOpenTop((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSub = (top: string, sub: string) => {
    const id = `${top}|${sub}`;
    setOpenSub((prev) => ({ ...prev, [id]: !prev[id] }));
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

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 flex-shrink-0">
              <Image
                src={directtaxImg}
                alt="Direct Tax Laws Compliance"
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
                Direct Tax Laws Compliance
              </h1>
              <p className="mt-2 text-gray-600 text-sm sm:text-base">
                Comprehensive study materials covering domestic and international taxation concepts.
              </p>
            </div>
          </div>
        </div>

        {/* Nested Dropdowns */}
        <div className="space-y-6">
          {Object.entries(pdfData).map(([topKey, subObj]) => (
            <div key={topKey} className="bg-white rounded-lg shadow-md">
              {/* Top Level */}
              <button
                onClick={() => toggleTop(topKey as "Domestic" | "International")}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <h2 className="text-xl font-semibold text-gray-800">{topKey} Taxation</h2>
                {openTop[topKey as keyof typeof openTop] ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {/* Sub-chapters */}
              {openTop[topKey as keyof typeof openTop] && (
                <div className="border-t border-gray-200">
                  {Object.entries(subObj).map(([subKey, pdfs]) => {
                    const subId = `${topKey}|${subKey}`;
                    return (
                      <div key={subKey} className="border-b border-gray-100 last:border-b-0">
                        <button
                          onClick={() => toggleSub(topKey, subKey)}
                          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none"
                        >
                          <h3 className="text-lg font-medium text-gray-700">{subKey}</h3>
                          {openSub[subId] ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>

                        {/* PDFs */}
                        {openSub[subId] && (
                          <div className="px-5 pb-4 space-y-2">
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
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen PDF Viewer */}
      {showModal && selectedPDF && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 z-[9999] bg-white flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[70%]">
              {selectedPDF.title}
            </h3>
            <button
              onClick={handleCloseModal}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={selectedPDF.src}
              className="w-full h-full border-0"
              title={selectedPDF.title}
              allow="fullscreen"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t flex justify-center shrink-0">
            <a
              href={selectedPDF.src}
              download={selectedPDF.download}
              className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}