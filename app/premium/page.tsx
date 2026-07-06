"use client";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { EnquiryRemarksNotices } from "@/components/EnquiryRemarksNotices";
import { IcpaMaterialsNotice } from "@/components/IcpaMaterialsNotice";
import Link from "next/link";
import Image from "next/image";
import accountancy from "../../assets/Accountancy.webp";
import complaince from "../../assets/complaiance.webp";
import directax from "../../assets/directtax.webp";
import appliedfinance from "../../assets/fourthimage.webp";
import {
  ClipboardList,
  History,
  ClipboardPenLine,
  FileCheck,
  Radio,
} from "lucide-react";

const PremiumPage = () => {
  const courses = [
    { title: "Indirect Tax Laws Compliance (ITLC)", route: "/premium/courses/indirecttax", image: accountancy },
    { title: "Business Regulatory Laws Compliance (BRLC)", route: "/premium/courses/business", image: complaince },
    { title: "Direct Tax Laws Compliance (DTLC)", route: "/premium/courses/directtax", image: directax },
    { title: "Applied Financial Accounting & Ethics (AFAE)", route: "/premium/courses/appliedfinance", image: appliedfinance },
  ];

  const quickLinks = [
    { href: "/premium/sessions", label: "Sessions", icon: Radio },
    { href: "/previous", label: "Previous Sessions", icon: History },
    { href: "/modelpaper", label: "Model Papers", icon: ClipboardPenLine },
    { href: "/premium/tests", label: "Practice Tests", icon: ClipboardPenLine },
    { href: "/premium/certificates", label: "Certificates", icon: FileCheck },
    { href: "/premium/vlogs", label: "Vlogs & Materials", icon: ClipboardList },
  ];

  return (
    <AuthenticatedLayout title="Dashboard" maxWidth="full">
      <div className="space-y-8">
        <EnquiryRemarksNotices />

        <IcpaMaterialsNotice />

        <section className="rounded-3xl bg-gradient-to-r from-purple-700 via-violet-700 to-fuchsia-700 text-white p-8 md:p-10 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">ICPA LMS Access</h2>
          
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 mb-5">ICPA LMS Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
              >
                <Icon className="w-6 h-6 text-purple-700" />
                <span className="font-semibold text-slate-800">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        
      </div>
    </AuthenticatedLayout>
  );
};

export default PremiumPage;
