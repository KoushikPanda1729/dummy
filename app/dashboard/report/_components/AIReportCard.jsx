"use client";

import { calculatePerformance } from "@/lib/utils/helper";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import CompanyLogo from "./CompanyLogo";

export default function AIReportCard({
  id,
  companyLogo,
  companyName = "Company",
  interviewTitle = "Interview",
  position = "Position",
  userName = "Candidate",
  overallScore = 0,
  recommendation,
  Skill_Evaluation = {},
  summary = "No summary provided.",
  fullReport = null,
  interviewData = null,
}) {
  const performance = calculatePerformance(overallScore);

  // Debug logging with error handling
  try {
    console.log("🔍 AIReportCard received complete data:");
    console.log("- fullReport exists:", !!fullReport);
    console.log(
      "- fullReport.reasons count:",
      fullReport?.reasons?.length || 0
    );
    console.log(
      "- fullReport.Areas_for_Improvement count:",
      fullReport?.Areas_for_Improvement?.length || 0
    );
    console.log("- fullReport.final_verdict:", fullReport?.final_verdict);
    console.log("- fullReport.duration:", fullReport?.duration);
    console.log(
      "- fullReport.most_frequent_words:",
      fullReport?.most_frequent_words_used_in_conversations
    );
    console.log("- interviewData exists:", !!interviewData);
    console.log(
      "- interviewData.questions count:",
      interviewData?.questions?.length || 0
    );
    console.log(
      "- interviewData.college_interview exists:",
      !!interviewData?.college_interview
    );
    console.log(
      "- interviewData.resume length:",
      interviewData?.college_interview?.resume?.length || 0
    );
    console.log(
      "- Skill_Evaluation keys:",
      Object.keys(Skill_Evaluation || {})
    );
    console.log("- Summary length:", summary?.length || 0);
  } catch (err) {
    console.error("❌ Error in AIReportCard debug logging:", err);
  }

  const skills = [
    { label: "Problem solving", key: "Problem_Solving_Approach" },
    { label: "Technical knowledge", key: "technical_knowledge" },
    { label: "Communication clarity", key: "Communication_Clarity" },
    { label: "Confidence & Composure", key: "Confidence_&_Composure" },
    { label: "Best practices", key: "Best_Practices_&_Style" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 bg-white rounded-2xl text-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div>
            <CompanyLogo
              logo={companyLogo}
              company={companyName?.charAt(0).toUpperCase()}
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-black">{companyName}</h2>
            <p className="text-sm text-black">{interviewTitle}</p>
          </div>
        </div>
        <div>
          <Link
            href={`/dashboard/report/${id}`}
            className="bg-[#462eb4] hover:shadow-2xl text-white px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 cursor-pointer transition duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
          >
            View Full Report
          </Link>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-50 pt-4 mb-6 gap-4">
        <div className="border border-gray-50 text-center shadow-sm px-12 py-4">
          <p className="text-black text-sm">Candidate</p>
          <p className="font-semibold text-md truncate">
            {userName?.toUpperCase()}
          </p>
        </div>

        <div className="text-center border border-gray-50 shadow-sm px-12 py-4">
          <p className="text-black text-sm">Score</p>
          <p className="text-2xl font-bold text-teal-600">{overallScore}/100</p>
        </div>

        <div className="text-center border border-gray-50 shadow-sm px-12 py-4">
          <p className="text-black text-sm">Performance</p>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${
              performance?.status ? "bg-teal-500" : "bg-red-500"
            }`}
          >
            {performance?.status ? (
              <ThumbsUp size={16} className="mr-1" />
            ) : (
              <ThumbsDown size={16} className="mr-1" />
            )}
            {performance?.tag || "N/A"}
          </div>
        </div>
      </div>

      {/* Skills Assessment */}
      <div>
        <h3 className="text-lg font-semibold mb-1.5 text-black">
          Skills Assessment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map(({ label, key }) => {
            const skillData = Skill_Evaluation?.[key];
            const rating = skillData?.rating;
            const notes = skillData?.notes;
            const displayScore =
              rating !== null && rating !== undefined ? `${rating}/5` : "N/A";

            return (
              <div
                key={key}
                className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-50 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-black">
                    {label}
                  </span>
                  <span
                    className={`font-bold text-sm ${
                      rating ? "text-teal-600" : "text-gray-500"
                    }`}
                  >
                    {displayScore}
                  </span>
                </div>
                {notes && <p className="text-xs text-black mt-1">{notes}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-1.5 mt-6 text-black">
          Performance Summary
        </h3>
        <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
          {summary}
        </p>
      </div>

      {/* Additional Report Sections */}
      {fullReport && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-black">
            Complete Report Data
          </h3>

          {/* Basic Report Info */}
          <div className="bg-blue-50 p-4 rounded-lg border mb-4">
            <h4 className="font-medium text-black mb-2">Report Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-black">Overall Score:</p>
                <p className="font-bold">
                  {fullReport.final_verdict?.score || overallScore}/100
                </p>
              </div>
              <div>
                <p className="text-black">Recommendation:</p>
                <p className="font-bold">
                  {fullReport.final_verdict?.recommendation || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-black">Duration:</p>
                <p className="font-bold">
                  {fullReport.duration || "N/A"} seconds
                </p>
              </div>
              <div>
                <p className="text-black">Most Used Words:</p>
                <p className="font-bold">
                  {fullReport.most_frequent_words_used_in_conversations ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Skill Evaluation - with error handling */}
          {(() => {
            try {
              return (
                <div className="mb-6">
                  <h4 className="font-medium text-black mb-3">
                    Detailed Skill Assessment
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(Skill_Evaluation || {}).map(
                      ([key, skill]) => (
                        <div
                          key={key}
                          className="bg-gray-50 p-3 rounded-lg border"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="font-medium text-black text-sm capitalize">
                              {key.replace(/[_&]/g, " ")}
                            </h5>
                            <span className="text-sm font-bold text-teal-600">
                              {skill?.rating || "N/A"}/5
                            </span>
                          </div>
                          <p className="text-xs text-black">
                            {skill?.notes || "No notes available"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            } catch (err) {
              console.error("❌ Error rendering skills:", err);
              return (
                <div className="text-red-500 text-sm">
                  Error displaying skills assessment
                </div>
              );
            }
          })()}

          {/* Areas for Improvement and Key Data */}
          {(() => {
            try {
              return (
                <div className="space-y-4">
                  {/* Reasons */}
                  {fullReport.reasons && fullReport.reasons.length > 0 && (
                    <div>
                      <h4 className="font-medium text-black mb-2">
                        Key Decision Factors ({fullReport.reasons.length})
                      </h4>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <ul className="space-y-1 text-sm">
                          {fullReport.reasons
                            .slice(0, 5)
                            .map((reason, index) => (
                              <li key={index} className="text-black">
                                • {reason}
                              </li>
                            ))}
                          {fullReport.reasons.length > 5 && (
                            <li className="text-black italic">
                              + {fullReport.reasons.length - 5} more reasons...
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {fullReport.Areas_for_Improvement &&
                    fullReport.Areas_for_Improvement.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-2">
                          Areas for Improvement (
                          {fullReport.Areas_for_Improvement.length})
                        </h4>
                        <div className="bg-red-50 p-3 rounded-lg border">
                          <ul className="space-y-1 text-sm">
                            {fullReport.Areas_for_Improvement.map(
                              (area, index) => (
                                <li key={index} className="text-black">
                                  • {area}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                  {/* Key Strengths */}
                  {fullReport.Key_Strengths &&
                    fullReport.Key_Strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-2">
                          Key Strengths ({fullReport.Key_Strengths.length})
                        </h4>
                        <div className="bg-green-50 p-3 rounded-lg border">
                          <ul className="space-y-1 text-sm">
                            {fullReport.Key_Strengths.map((strength, index) => (
                              <li key={index} className="text-black">
                                • {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                  {/* Topics to Focus On */}
                  {fullReport.Topics_to_focus_on &&
                    fullReport.Topics_to_focus_on.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-2">
                          Topics to Focus On (
                          {fullReport.Topics_to_focus_on.length})
                        </h4>
                        <div className="bg-blue-50 p-3 rounded-lg border">
                          <ul className="space-y-1 text-sm">
                            {fullReport.Topics_to_focus_on.map(
                              (topic, index) => (
                                <li key={index} className="text-black">
                                  • {topic}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                  {/* Suggested Learning Resources */}
                  {fullReport.Suggested_Learning_Resources &&
                    fullReport.Suggested_Learning_Resources.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-2">
                          Suggested Learning Resources (
                          {fullReport.Suggested_Learning_Resources.length})
                        </h4>
                        <div className="bg-purple-50 p-3 rounded-lg border">
                          <ul className="space-y-1 text-sm">
                            {fullReport.Suggested_Learning_Resources.map(
                              (resource, index) => (
                                <li key={index} className="text-black">
                                  • {resource}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                  {/* Question-wise Feedback */}
                  {fullReport.Question_Wise_Feedback &&
                    fullReport.Question_Wise_Feedback.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-2">
                          Question-wise Feedback (
                          {fullReport.Question_Wise_Feedback.length})
                        </h4>
                        <div className="space-y-2">
                          {fullReport.Question_Wise_Feedback.map(
                            (feedback, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded-lg border"
                              >
                                <p className="text-sm text-black">{feedback}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              );
            } catch (err) {
              console.error("❌ Error rendering report sections:", err);
              return (
                <div className="text-red-500 text-sm">
                  Error displaying some report sections
                </div>
              );
            }
          })()}

          {/* Interview Data Summary */}
          {(() => {
            try {
              if (!interviewData) return null;

              return (
                <div className="mt-6">
                  <h4 className="font-medium text-black mb-3">
                    Interview Information
                  </h4>
                  <div className="bg-green-50 p-3 rounded-lg border">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-black">Questions Available:</p>
                        <p className="font-bold">
                          {interviewData.questions?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-black">Interview Type:</p>
                        <p className="font-bold">
                          {interviewData.type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-black">Duration:</p>
                        <p className="font-bold">
                          {Math.floor((interviewData.duration || 0) / 60)}{" "}
                          minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-black">Resume Available:</p>
                        <p className="font-bold">
                          {interviewData.college_interview?.resume
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } catch (err) {
              console.error("❌ Error rendering interview data:", err);
              return (
                <div className="text-red-500 text-sm mt-4">
                  Error displaying interview information
                </div>
              );
            }
          })()}

          {/* Show sample questions if available */}
          {(() => {
            try {
              if (
                !interviewData?.questions ||
                interviewData.questions.length === 0
              )
                return null;

              return (
                <div className="mt-6">
                  <h4 className="font-medium text-black mb-3">
                    Sample Interview Questions (First 3)
                  </h4>
                  <div className="space-y-2">
                    {interviewData.questions.slice(0, 3).map((q, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg border"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-black text-sm">
                            Q{index + 1}
                          </h5>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {q.type || "N/A"}
                          </span>
                        </div>
                        <p className="text-sm text-black">{q.question}</p>
                      </div>
                    ))}
                    {interviewData.questions.length > 3 && (
                      <div className="text-center text-black text-sm">
                        + {interviewData.questions.length - 3} more questions
                        available
                      </div>
                    )}
                  </div>
                </div>
              );
            } catch (err) {
              console.error("❌ Error rendering questions:", err);
              return (
                <div className="text-red-500 text-sm">
                  Error displaying questions
                </div>
              );
            }
          })()}

          {/* Technical Info */}
          <div className="mt-6">
            <h4 className="font-medium text-black mb-2">Technical Details</h4>
            <div className="bg-gray-50 p-3 rounded-lg border text-sm">
              <p>
                <span className="text-black">Report ID:</span>{" "}
                <code className="text-xs text-black">{id}</code>
              </p>
              <p>
                <span className="text-black">Created:</span>{" "}
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Raw Data Toggle */}
          <details className="mt-6">
            <summary className="font-medium text-black cursor-pointer hover:text-black text-sm">
              🔍 View Raw Report Data
            </summary>
            <div className="mt-2 bg-gray-50 p-3 rounded border max-h-60 overflow-y-auto">
              <pre className="text-xs text-black">
                {JSON.stringify(fullReport, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
