"use client";

import Link from "next/link";
import { Calendar, MapPin, BadgeCheck } from "lucide-react";
import type { CandidateProfile } from "@/lib/candidateExamSchedule";
import {
  countCompletedExamLevels,
  getExamStatusDisplay,
  isExamLevelCompleted,
  isPracticeUrl,
  shouldShowAttendExamLink,
} from "@/lib/examResults";

const MOCK_EXAM_LINK =
  "https://test.tallyeducation.com/links/a4ffec55-f3a8-11f0-8447-0ac472d4f9eb/";
const FINAL_CTPR_LINK =
  "https://test.tallyeducation.com/links/96dcca2f-f68e-11f0-bcaf-06ac946976b1/";

export interface ExamResultsViewProps {
  candidate: CandidateProfile;
  fullName: string;
  practiceTestsHref: string;
  resultStatus?: string | null;
  title?: string;
}

export function ExamResultsView({
  candidate,
  fullName,
  practiceTestsHref,
  resultStatus,
  title = "RESULTS & EXAM SCHEDULE",
}: ExamResultsViewProps) {
  const completedLevels = countCompletedExamLevels(candidate);
  const totalLevels = 4;
  const progressPercentage = (completedLevels / totalLevels) * 100;
  const isFullyQualified = completedLevels === totalLevels;

  const practiceLink = isPracticeUrl(candidate.self_test_practice)
    ? candidate.self_test_practice!.trim()
    : practiceTestsHref;

  const levelCards = [
    {
      level: 1,
      name: "MEPSC ASSESSMENT",
      status: candidate.mepsc_assesment,
      link: null as string | null,
      isPractice: false,
      isMock: false,
    },
    {
      level: 2,
      name: "SELF TEST PRACTICE",
      status: candidate.self_test_practice,
      link: practiceLink,
      isPractice: true,
      isMock: false,
    },
    {
      level: 3,
      name: "MOCK EXAM",
      status: candidate.mock_exam,
      link: MOCK_EXAM_LINK,
      isPractice: false,
      isMock: true,
    },
    {
      level: 4,
      name: "FINAL CTPR EXAM",
      status: candidate.final_ctpr_exam,
      link: FINAL_CTPR_LINK,
      isPractice: false,
      isMock: false,
    },
  ];

  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold text-white bg-blue-600 py-6 rounded-t-2xl shadow-lg text-center mb-8">
        {title}
      </h1>

      {resultStatus && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
            Overall Result Status
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-900">{resultStatus}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
          <p className="text-sm font-semibold">NAME</p>
          <p className="text-sm font-bold mt-2">{candidate.name || fullName}</p>
        </div>
        <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
          <p className="text-sm font-semibold">MEMBERSHIP ID</p>
          <p className="text-sm font-bold mt-2">
            {String(candidate.membership_id).padStart(5, "0")}
          </p>
        </div>
        <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
          <p className="text-sm font-semibold">CANDIDATE ID</p>
          <p className="text-sm font-bold mt-2">{candidate.can_id || "—"}</p>
        </div>
      </div>

      <div className="mb-12 bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Exam Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center">
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">MEPSC Exam Date</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {candidate.exam_date
                ? new Date(candidate.exam_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Not Scheduled"}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <MapPin className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">Place</p>
            <p className="text-lg font-semibold text-gray-900 mt-1 uppercase">
              {candidate.place || "—"}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <BadgeCheck className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">State</p>
            <p className="text-lg font-semibold text-gray-900 mt-1 uppercase">
              {candidate.state || "—"}
            </p>
          </div>
        </div>
        {(candidate.batch_name || candidate.batch_id) && (
          <p className="mt-6 text-center text-sm text-gray-700">
            Batch:{" "}
            <span className="font-semibold">
              {candidate.batch_name || candidate.batch_id}
            </span>
          </p>
        )}
        {(candidate.qualification_status || candidate.next_step) && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {candidate.qualification_status && (
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Qualification Status
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {candidate.qualification_status}
                </p>
              </div>
            )}
            {candidate.next_step && (
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Next Step
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {candidate.next_step}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-12 bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Qualification Progress
        </h3>
        <div className="relative pt-1">
          <div className="overflow-hidden h-8 mb-4 text-xs flex rounded-full bg-gray-200 shadow-inner">
            <div
              style={{ width: `${progressPercentage}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 font-medium ${
                isFullyQualified
                  ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
              }`}
            >
              <span>
                {completedLevels} / {totalLevels} Levels Completed
              </span>
            </div>
          </div>
        </div>
        <div className="text-center">
          {isFullyQualified ? (
            <div className="inline-block px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xl rounded-full shadow-xl">
              🎉 FULLY QUALIFIED – All Levels Completed!
            </div>
          ) : (
            <p className="text-xl font-semibold text-gray-900">
              Current Status: {completedLevels} of {totalLevels} levels passed
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {levelCards.map((item) => {
          const statusInfo = getExamStatusDisplay(item.status, {
            isPractice: item.isPractice,
            isMock: item.isMock,
          });

          const showAttendLink =
            item.link &&
            !item.isPractice &&
            shouldShowAttendExamLink(item.status);

          const practiceCompleted =
            item.isPractice &&
            isExamLevelCompleted(item.status, { isPractice: true });

          const cardClasses = item.isPractice
            ? practiceCompleted
              ? `${statusInfo.color} ${statusInfo.glow}`
              : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/60"
            : `${statusInfo.color} ${statusInfo.glow}`;

          return (
            <div
              key={item.level}
              className={`group relative text-white text-center py-12 px-6 md:px-8 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/30 overflow-hidden transition-all duration-700 hover:shadow-3xl hover:-translate-y-8 hover:scale-105 cursor-pointer ${cardClasses}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />

              <div className="relative z-10">
                <p className="text-lg font-semibold mb-6 tracking-wide">
                  {item.name}
                </p>

                {item.isPractice ? (
                  practiceCompleted ? (
                    <p className="text-xl font-black drop-shadow-2xl group-hover:scale-125 transition-all duration-500 uppercase mb-6">
                      {statusInfo.text}
                    </p>
                  ) : isPracticeUrl(candidate.self_test_practice) ? (
                    <a
                      href={practiceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-4 px-6 py-3 bg-white text-indigo-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 text-base"
                    >
                      Go to Practice Tests
                    </a>
                  ) : (
                    <Link
                      href={practiceLink}
                      className="block mt-4 px-6 py-3 bg-white text-indigo-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 text-base"
                    >
                      Go to Practice Tests
                    </Link>
                  )
                ) : showAttendLink ? (
                  <a
                    href={item.link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 px-3 py-3 bg-white text-red-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 text-base"
                  >
                    Attend, if scheduled
                  </a>
                ) : (
                  <p className="text-xl font-black drop-shadow-2xl group-hover:scale-125 transition-all duration-500 uppercase mb-6">
                    {statusInfo.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
