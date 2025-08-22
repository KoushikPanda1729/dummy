"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

import InterviewSummary from "@/app/dashboard/report/_components/InterviewSummary";
import OverallFeedbackSection from "@/app/dashboard/report/_components/OverallFeedbackSection";
import QuestionsWiseFeedback from "@/app/dashboard/report/_components/QuestionsWiseFeedback";
import ChatComponent from "@/app/dashboard/report/_components/ChatComponent";

const tabs = [
  "Interview Summary",
  "Overall Feedback",
  "Questions",
  "Interview Copilot",
];

export default function Tabs({ content, code, reportDetails }) {
  const [activeTab, setActiveTab] = useState(0);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  const { user } = useUser();

  console.log("Report Details:", reportDetails);

  // Handle chat conversation
  let finalConversation = [];
  try {
    const rawChat = reportDetails?.interview_attempts?.chat_conversation;
    if (typeof rawChat === "string" && rawChat.trim()) {
      const parsed = JSON.parse(rawChat);
      if (parsed && Array.isArray(parsed.current)) {
        finalConversation = parsed.current.filter(
          (msg) => msg.role !== "system"
        );
      }
    }
  } catch (err) {
    //console.error('❌ Failed to parse chat:', err)
  }

  const [chat, setChat] = useState(finalConversation);

  const reportInString = JSON.stringify(reportDetails?.report);
  const feedback = {
    areasForImprovement: reportDetails?.report_data?.Areas_for_Improvement, // Changed path
    keyStrengths: reportDetails?.report_data?.Key_Strengths, // Changed path
    suggestedLearningResources:
      reportDetails?.report_data?.Suggested_Learning_Resources, // Changed path
    topicsToFocusOn: reportDetails?.report_data?.Topics_to_focus_on, // Changed path
  };

  useLayoutEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [activeTab]);

  const tabContents = [
    <InterviewSummary
      id={reportDetails?.id}
      companyLogo={reportDetails?.interview_attempts?.interviews?.company_logo}
      companyName={reportDetails?.interview_attempts?.interviews?.company}
      interviewTitle={
        reportDetails?.interview_attempts?.interviews?.interview_name
      }
      position={reportDetails?.interview_attempts?.interviews?.position}
      userName={user?.firstName}
      overallScore={reportDetails?.overall_score} // Changed from reportDetails?.score
      recommendation={
        reportDetails?.report_data?.final_verdict?.recommendation === "YES"
      } // Updated logic
      Skill_Evaluation={reportDetails?.report_data?.Skill_Evaluation} // Changed from reportDetails?.report?.Skill_Evaluation
      summary={reportDetails?.report_data?.overall_summary} // Changed from reportDetails?.report?.overall_summary
    />,
    <OverallFeedbackSection feedback={reportDetails?.report_data} />,
    <QuestionsWiseFeedback
      feedbackData={reportDetails?.interview_id?.questions}
    />,
    <ChatComponent report={reportInString} chat={chat} setChat={setChat} user={user} />,

    <OverallFeedbackSection feedback={reportDetails?.report_data} />,
    <QuestionsWiseFeedback
      feedbackData={reportDetails?.report_data?.Question_Wise_Feedback} // Changed to actual feedback data
      questions={reportDetails?.interview_id?.questions} // Pass questions separately if needed
    />,
    <ChatComponent report={reportInString} chat={chat} setChat={setChat} user={user} />,
  ];

  return (
    <div className="w-full">
      {/* Simple Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex justify-center lg:justify-start px-6">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === index
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Simple Tab Content */}
      <div className="relative">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          ref={contentRef}
          className="p-6 lg:p-8 bg-white min-h-96"
        >
          <div className="max-w-6xl mx-auto">
            {tabContents[activeTab]}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
