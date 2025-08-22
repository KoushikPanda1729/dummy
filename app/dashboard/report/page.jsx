"use client";

import {
  BarChart3,
  BookOpenCheck,
  Briefcase,
  Building,
  Building2,
  ClipboardList,
  FileText,
  Star,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import fetchInterviewReport from "@/app/service/interview/fetchInterviewReport";
import LoadingOverlay from "@/components/LoadingOverlay";
import { formatDate } from "@/lib/utils/helper";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);

  const { user } = useUser();
  const router = useRouter();

  const metricIcons = {
    "bar-chart-3": BarChart3,
    "clipboard-list": ClipboardList,
    trophy: Trophy,
    "book-open-check": BookOpenCheck,
  };

  const averageScore = useMemo(() => {
    if (reports.length === 0) return "N/A";
    const scores = reports
      .map((r) => parseInt(r.score))
      .filter((s) => !isNaN(s));
    if (scores.length === 0) return "N/A";
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return `${Math.round(avg)}/100`;
  }, [reports]);

  const highScore = useMemo(() => {
    if (reports.length === 0) return "N/A";
    const scores = reports
      .map((r) => parseInt(r.score))
      .filter((s) => !isNaN(s));
    if (scores.length === 0) return "N/A";
    return `${Math.max(...scores)}/100`;
  }, [reports]);

  const performanceMetrics = [
    {
      title: "Total Reports",
      value: `${reports?.length}`,
      icon: "clipboard-list",
    },
    {
      title: "Average Score",
      value: averageScore,
      icon: "bar-chart-3",
    },
    {
      title: "High Score",
      value: highScore,
      icon: "trophy",
    },
  ];

  useEffect(() => {
    async function getReports() {
      try {
        setLoading(true);
        setError("");

        const result = await fetchInterviewReport();
        console.log("API Response:", result);

        // Extract data from the response
        let extractedData = [];

        if (Array.isArray(result)) {
          extractedData = result;
        } else if (result?.data && Array.isArray(result.data)) {
          extractedData = result.data;
        } else if (result?.reports && Array.isArray(result.reports)) {
          extractedData = result.reports;
        } else if (result && typeof result === "object") {
          const values = Object.values(result);
          const arrayValue = values.find((val) => Array.isArray(val));
          if (arrayValue) {
            extractedData = arrayValue;
          }
        }

        console.log("Extracted data:", extractedData);

        if (extractedData.length > 0) {
          setReports(extractedData);
        } else {
          setReports([]);
          setError("No reports found in the response");
        }
      } catch (error) {
        console.error("API call failed:", error);
        setError(`API Error: ${error.message}`);
        setReports([]);
      } finally {
        setLoading(false);
      }
    }

    getReports();
  }, []);

  if (loading) {
    return <LoadingOverlay text="Loading Report..." />;
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-24 lg:pt-8 px-4">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto pt-24 lg:pt-8 px-4 sm:px-6 lg:px-8">
          {/* Modern Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-indigo-100 rounded-full px-6 py-3 mb-6">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-700 font-medium">Performance Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent mb-4">
              Interview Reports
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your interview performance and identify areas for improvement
            </p>
          </motion.div>

          {/* Enhanced Performance Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {performanceMetrics.map((metric, i) => {
              const Icon = metricIcons[metric.icon] || FileText;
              const colors = [
                { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600', bgLight: 'bg-blue-50' },
                { bg: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', bgLight: 'bg-emerald-50' },
                { bg: 'from-amber-500 to-orange-500', text: 'text-amber-600', bgLight: 'bg-amber-50' }
              ];

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[i].bg} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors[i].bgLight} ${colors[i].text}`}>
                      Active
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                    <h4 className="text-3xl font-bold text-gray-900 mb-2">
                      {metric.value}
                    </h4>
                    <div className={`w-full h-1 rounded-full ${colors[i].bgLight}`}>
                      <div className={`h-1 rounded-full bg-gradient-to-r ${colors[i].bg} w-3/4`}></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {reports.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-6">Start your first interview to see your performance reports here.</p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Start Interview
              </button>
            </motion.div>
          )}

          {reports.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
                <div className="text-sm text-gray-500">
                  {reports.length} report{reports.length !== 1 ? 's' : ''} found
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports.map((report, index) => {
                  // Extract the data safely
                  const interviewData =
                    report?.interview_attempts?.interviews ||
                    report?.interview_attempts?.interview_id;
                  const companyName = interviewData?.company || "Unknown Company";
                  const interviewName =
                    interviewData?.interview_name || "Interview Report";
                  const position =
                    interviewData?.position || "Position Not Available";
                  const companyLogo =
                    interviewData?.company_logo || "Not Available";
                  const createdDate =
                    interviewData?.created_date ||
                    report?.interview_attempts?.started_at ||
                    report?.created_at;

                  const score = parseInt(report?.score) || 0;
                  const getScoreColor = (score) => {
                    if (score >= 80) return 'from-emerald-500 to-green-500';
                    if (score >= 60) return 'from-yellow-500 to-orange-500';
                    return 'from-red-500 to-pink-500';
                  };

                  return (
                    <motion.div
                      key={`report-${report?.id || index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer"
                      onClick={() => router.push(`/dashboard/report/${report?.id}`)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold text-white">
                              {companyName?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {interviewName}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(createdDate) || "Date Not Available"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getScoreColor(score)} text-white shadow-lg`}>
                            {score}/100
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 font-medium">{companyName}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 font-medium">{position}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Performance Score</span>
                            <span className="font-medium text-gray-900">{score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                              className={`h-2 rounded-full bg-gradient-to-r ${getScoreColor(score)}`}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Click to view detailed report</span>
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                              <svg className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
