// components/OverallFeedbackSection.jsx
"use client"; // This directive is necessary for client-side components in Next.js

import React from "react";
import { Lightbulb, BookOpen, Target, Sparkles, XCircle } from "lucide-react"; // Added XCircle for an empty state icon

export default function OverallFeedbackSection({ feedback }) {
  console.log("Overall Feedback Section - Feedback:", feedback);

  // Handle both old and new data structures
  const areasForImprovement =
    feedback?.Areas_for_Improvement || feedback?.areasForImprovement || [];
  const keyStrengths = feedback?.Key_Strengths || feedback?.keyStrengths || [];
  const suggestedLearningResources =
    feedback?.Suggested_Learning_Resources ||
    feedback?.suggestedLearningResources ||
    [];
  const topicsToFocusOn =
    feedback?.Topics_to_Focus_On || feedback?.topicsToFocusOn || [];

  const hasFeedback =
    areasForImprovement.length > 0 ||
    keyStrengths.length > 0 ||
    suggestedLearningResources.length > 0 ||
    topicsToFocusOn.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-md">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 text-center">
        Overall Feedback
      </h2>

      {!hasFeedback ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
          <XCircle size={48} className="mb-4 text-gray-400 dark:text-red-600" />
          <p className="text-lg font-medium">No feedback available yet.</p>
          <p className="text-sm mt-2">
            Please complete the interview to generate feedback.
          </p>
        </div>
      ) : (
        <>
          {/* Areas for Improvement */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-4 border-b pb-3 border-gray-100 dark:border-zinc-800">
              <Lightbulb
                className="mr-3 text-yellow-600 dark:text-yellow-400"
                size={22}
              />
              Areas for Improvement
            </h3>
            {areasForImprovement.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {areasForImprovement.map((area, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-full text-sm font-medium shadow-sm transition-transform duration-200 hover:scale-105"
                  >
                    {area}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-base">
                No specific areas for improvement listed.
              </p>
            )}
          </div>

          {/* Key Strengths */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-4 border-b pb-3 border-gray-100 dark:border-zinc-800">
              <Sparkles
                className="mr-3 text-green-600 dark:text-green-400"
                size={22}
              />
              Key Strengths
            </h3>
            {keyStrengths.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {keyStrengths.map((strength, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full text-sm font-medium shadow-sm transition-transform duration-200 hover:scale-105"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-base">
                No key strengths listed.
              </p>
            )}
          </div>

          {/* Topics to Focus On */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-4 border-b pb-3 border-gray-100 dark:border-zinc-800">
              <Target
                className="mr-3 text-blue-600 dark:text-blue-400"
                size={22}
              />
              Topics to Focus On
            </h3>
            {topicsToFocusOn.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {topicsToFocusOn.map((topic, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium shadow-sm transition-transform duration-200 hover:scale-105"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-base">
                No specific topics to focus on listed.
              </p>
            )}
          </div>

          {/* Suggested Learning Resources */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-4 border-b pb-3 border-gray-100 dark:border-zinc-800">
              <BookOpen
                className="mr-3 text-indigo-600 dark:text-indigo-400"
                size={22}
              />
              Suggested Learning Resources
            </h3>
            {suggestedLearningResources.length > 0 ? (
              <ul className="list-none space-y-3">
                {suggestedLearningResources.map((resource, index) => (
                  <li key={index}>
                    {typeof resource === "string" ? (
                      <span className="inline-flex items-center text-indigo-600 dark:text-indigo-400 text-base font-medium p-3 -m-3 rounded-lg">
                        {resource}
                      </span>
                    ) : (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline text-base font-medium transition-colors p-3 -m-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        <span className="mr-2">{resource.name}</span>
                        {/* External link icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-base">
                No suggested learning resources available.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
