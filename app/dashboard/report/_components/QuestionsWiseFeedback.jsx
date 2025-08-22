'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function QuestionsWiseFeedback({ feedbackData, questions }) {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const toggleExpand = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const getScoreData = (scoreString) => {
    if (!scoreString || typeof scoreString !== 'string' || !scoreString.includes('/')) {
      return { score: 0, total: 100, percentage: 0, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
    }
    const [score, total] = scoreString.split('/').map(Number);
    if (isNaN(score) || isNaN(total) || total === 0) {
      return { score: 0, total: 100, percentage: 0, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
    }

    const percentage = (score / total) * 100;
    
    if (percentage >= 80) {
      return { score, total, percentage, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' };
    } else if (percentage >= 60) {
      return { score, total, percentage, color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
    } else {
      return { score, total, percentage, color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'technical':
        return <CheckCircle className="w-5 h-5" />;
      case 'behavioral':
        return <MessageSquare className="w-5 h-5" />;
      case 'case-based':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'technical':
        return 'from-blue-500 to-cyan-500';
      case 'behavioral':
        return 'from-green-500 to-emerald-500';
      case 'case-based':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  // Use questions prop if feedbackData is not available
  const questionsToShow = feedbackData && feedbackData.length > 0 ? feedbackData : questions || [];

  if (!questionsToShow || questionsToShow.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mb-6">
          <MessageSquare className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h3>
        <p className="text-gray-600 text-center max-w-md">
          Interview questions and feedback will appear here once available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg text-gray-600 mb-2">
          {questionsToShow.length} Question{questionsToShow.length !== 1 ? 's' : ''} Analyzed
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>

      <div className="space-y-4">
        {questionsToShow.map((item, index) => {
          const question = item.question || item;
          const feedback = item.feedback || 'No feedback available for this question.';
          const score = item.score || 'N/A';
          const type = item.type || 'General';
          const focus = item.focus || [];
          
          const scoreData = getScoreData(score);
          const isExpanded = expandedQuestion === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Question Header */}
              <button
                className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-start gap-4">
                  {/* Question Number & Type */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(type)} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      {getTypeIcon(type)}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-900">Question {index + 1}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(type)} text-white`}>
                        {type}
                      </span>
                      {score !== 'N/A' && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${scoreData.bgColor} ${scoreData.textColor}`}>
                          {score}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-3">
                      {typeof question === 'string' ? question : question.question || 'Question text not available'}
                    </p>

                    {/* Focus Areas */}
                    {focus.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {focus.map((focusArea, focusIndex) => (
                          <span
                            key={focusIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs"
                          >
                            {focusArea}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </motion.div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                {score !== 'N/A' && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Performance Score</span>
                      <span className="text-sm font-semibold text-gray-900">{scoreData.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          scoreData.color === 'green' ? 'from-green-400 to-green-600' :
                          scoreData.color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
                          'from-red-400 to-red-600'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${scoreData.percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      />
                    </div>
                  </div>
                )}
              </button>

              {/* Feedback Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Detailed Feedback</h4>
                          <div className="prose prose-gray prose-sm max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                              {feedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}