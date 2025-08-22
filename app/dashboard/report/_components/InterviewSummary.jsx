'use client';

import { calculatePerformance } from '@/lib/utils/helper';
import { ThumbsUp, ThumbsDown, TrendingUp, User, Award, Brain, MessageCircle, Zap, Target } from 'lucide-react'; 
import { motion } from 'framer-motion';

export default function InterviewSummary({
  id,
  companyLogo,
  companyName = 'Company',
  interviewTitle = 'Interview',
  position = 'Position',
  userName = 'Candidate',
  overallScore = 0,
  recommendation,
  Skill_Evaluation = {},
  summary = 'No summary provided.',
}) {
  const performance = calculatePerformance(overallScore);

  const skills = [
    { 
      label: 'Problem Solving', 
      key: 'Problem_Solving_Approach',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Technical Knowledge', 
      key: 'technical_knowledge',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      label: 'Communication', 
      key: 'Communication_Clarity',
      icon: MessageCircle,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Confidence', 
      key: 'Confidence_&_Composure',
      icon: Award,
      color: 'from-orange-500 to-red-500'
    },
    { 
      label: 'Best Practices', 
      key: 'Best_Practices_&_Style',
      icon: Target,
      color: 'from-indigo-500 to-purple-500'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Candidate Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Candidate</p>
              <p className="text-lg font-bold text-gray-900">{userName}</p>
            </div>
          </div>
        </motion.div>

        {/* Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Overall Score</p>
              <p className="text-3xl font-bold text-emerald-600">{overallScore}<span className="text-lg text-gray-500">/100</span></p>
            </div>
          </div>
        </motion.div>

        {/* Performance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 border ${
            performance?.status 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' 
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              performance?.status 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            }`}>
              {performance?.status ? (
                <ThumbsUp className="w-6 h-6 text-white" />
              ) : (
                <ThumbsDown className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Performance</p>
              <p className={`text-lg font-bold ${
                performance?.status ? 'text-green-600' : 'text-red-600'
              }`}>
                {performance?.tag || 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Skills Assessment */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 text-white" />
          </div>
          Skills Assessment
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {skills.map(({ label, key, icon: Icon, color }, index) => {
            const skillData = Skill_Evaluation?.[key];
            const rating = skillData?.rating;
            const notes = skillData?.notes;
            const score = rating !== null && rating !== undefined ? rating : 0;
            const percentage = (score / 5) * 100;
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{label}</h4>
                  </div>
                  <span className="text-2xl font-bold text-gray-700">{score}<span className="text-sm text-gray-400">/5</span></span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className={`h-2 rounded-full bg-gradient-to-r ${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.2 * index, duration: 0.8 }}
                    />
                  </div>
                </div>
                
                {notes && (
                  <p className="text-sm text-gray-600 leading-relaxed">{notes}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          Performance Summary
        </h3>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-100"
        >
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}