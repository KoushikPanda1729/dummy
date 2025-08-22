"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingDown, 
  Sparkles, 
  Target, 
  BookOpen, 
  AlertTriangle, 
  Star,
  Focus,
  GraduationCap,
  ExternalLink
} from "lucide-react";

export default function OverallFeedbackSection({ feedback }) {
  console.log("Overall Feedback Section - Feedback:", feedback);

  // Handle both old and new data structures
  const areasForImprovement = feedback?.Areas_for_Improvement || feedback?.areasForImprovement || [];
  const keyStrengths = feedback?.Key_Strengths || feedback?.keyStrengths || [];
  const suggestedLearningResources = feedback?.Suggested_Learning_Resources || feedback?.suggestedLearningResources || [];
  const topicsToFocusOn = feedback?.Topics_to_Focus_On || feedback?.topicsToFocusOn || [];
  const reasons = feedback?.reasons || [];

  const hasFeedback = areasForImprovement.length > 0 || keyStrengths.length > 0 || suggestedLearningResources.length > 0 || topicsToFocusOn.length > 0 || reasons.length > 0;

  const sections = [
    {
      title: "Key Decision Factors",
      data: reasons,
      icon: AlertTriangle,
      color: "orange",
      gradientFrom: "from-orange-500",
      gradientTo: "to-amber-500",
      bgColor: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200"
    },
    {
      title: "Areas for Improvement", 
      data: areasForImprovement,
      icon: TrendingDown,
      color: "red",
      gradientFrom: "from-red-500",
      gradientTo: "to-rose-500", 
      bgColor: "from-red-50 to-rose-50",
      borderColor: "border-red-200"
    },
    {
      title: "Key Strengths",
      data: keyStrengths,
      icon: Sparkles,
      color: "green", 
      gradientFrom: "from-green-500",
      gradientTo: "to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    {
      title: "Topics to Focus On",
      data: topicsToFocusOn,
      icon: Focus,
      color: "blue",
      gradientFrom: "from-blue-500", 
      gradientTo: "to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    }
  ];

  if (!hasFeedback) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Feedback Available</h3>
        <p className="text-gray-600 text-center max-w-md">
          Complete your interview to receive detailed feedback and improvement suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => {
        if (section.data.length === 0) return null;
        
        const Icon = section.icon;
        
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className={`bg-gradient-to-br ${section.bgColor} rounded-3xl p-8 border ${section.borderColor}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 bg-gradient-to-br ${section.gradientFrom} ${section.gradientTo} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                <p className="text-gray-600">{section.data.length} item{section.data.length !== 1 ? 's' : ''} identified</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.data.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sectionIndex * 0.1) + (index * 0.05) }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 bg-gradient-to-br ${section.gradientFrom} ${section.gradientTo} rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Learning Resources Section */}
      {suggestedLearningResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-200"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Learning Resources</h3>
              <p className="text-gray-600">Recommended resources for your growth</p>
            </div>
          </div>

          <div className="space-y-3">
            {suggestedLearningResources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.05) }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-all group"
              >
                {typeof resource === "string" ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{resource}</span>
                  </div>
                ) : (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between group-hover:text-purple-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium group-hover:text-purple-600">{resource.name}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
