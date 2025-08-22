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
import AIReportCard from "./_components/AIReportCard";
import Modal from "@/components/Modal";
import fetchInterviewReport from "@/app/service/interview/fetchInterviewReport";
import LoadingOverlay from "@/components/LoadingOverlay";
import { formatDate } from "@/lib/utils/helper";
import CompanyLogo from "./_components/CompanyLogo";
import EmptyStateComponent from "@/app/_components/EmptyStateComponent";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [openModalIndex, setOpenModalIndex] = useState(null);

  const { user } = useUser();

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
      <div>
        <div className="w-full max-w-4xl mx-auto  pt-24 lg:pt-8 px-4">
          <h1 className="flex items-center gap-2 w-full max-w-4xl mx-auto text-2xl font-bold text-black mb-6">
            <FileText className="text-gray-800" />
            Interview Reports
          </h1>

          {/* Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric, i) => {
              const Icon = metricIcons[metric.icon] || FileText;

              return (
                <div
                  key={i}
                  className="bg-white shadow rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="p-2 rounded-full bg-blue-50 text-indigo-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-black">{metric.title}</p>
                    <h4 className="text-lg font-semibold text-black">
                      {metric.value}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto pt-4 px-4">
          {reports.length === 0 && !loading && (
            <EmptyStateComponent
              title="No reports found"
              description="Looks like there's nothing here yet."
            />
          )}

          {reports.length > 0 &&
            reports.map((report, index) => {
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

              console.log(`Rendering report ${index}:`, {
                companyName,
                interviewName,
                position,
                score: report?.score,
              });

              return (
                <div
                  key={`report-${report?.id || index}`}
                  className="mb-4 border-2 border-blue-300 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-200"
                  style={{ minHeight: "120px", backgroundColor: "#ffffff" }}
                >
                  {/* Card Content */}
                  <div className="flex items-start justify-between p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-800">
                          {companyName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => setOpenModalIndex(index)}
                          className="text-lg font-bold cursor-pointer text-blue-600 hover:underline text-left block"
                          style={{ color: "#1e40af" }}
                        >
                          {interviewName}
                        </button>
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <span className="flex items-center gap-1 bg-gray-100 border border-gray-400 text-xs px-3 py-1 rounded">
                            <Building2 className="w-3 h-3 text-gray-600" />
                            <span style={{ color: "#374151" }}>
                              {companyName}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 bg-gray-100 border border-gray-400 text-xs px-3 py-1 rounded">
                            <Briefcase className="w-3 h-3 text-gray-600" />
                            <span style={{ color: "#374151" }}>{position}</span>
                          </span>
                        </div>
                        <p
                          className="text-sm mt-2"
                          style={{ color: "#374151" }}
                        >
                          Date:{" "}
                          <span
                            className="font-medium"
                            style={{ color: "#111827" }}
                          >
                            {formatDate(createdDate) || "Date Not Available"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right bg-teal-50 p-3 rounded-lg">
                      <h3
                        className="text-3xl font-bold"
                        style={{ color: "#0d9488" }}
                      >
                        {report?.score}
                        <span className="text-lg" style={{ color: "#111827" }}>
                          /100
                        </span>
                      </h3>
                    </div>
                  </div>

                  {/* Modal with Animation */}

                  <AIReportCard
                    id={report?.id}
                    companyLogo={companyLogo}
                    companyName={companyName}
                    interviewTitle={interviewName}
                    position={position}
                    userName={user?.firstName}
                    overallScore={report?.score}
                    recommendation={
                      report?.recommendation?.[0] === "true" ||
                      !!report?.recommendation
                    }
                    Skill_Evaluation={report?.report?.Skill_Evaluation}
                    summary={report?.report?.overall_summary}
                    fullReport={report?.report}
                    interviewData={interviewData}
                    rawReportData={report}
                  />
                  <AnimatePresence>
                    {openModalIndex === index && (
                      <Modal
                        isOpen={openModalIndex === index}
                        onClose={() => setOpenModalIndex(null)}
                        width="max-w-4xl"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <AIReportCard
                            id={report?.id}
                            companyLogo={companyLogo}
                            companyName={companyName}
                            interviewTitle={interviewName}
                            position={position}
                            userName={user?.firstName}
                            overallScore={report?.score}
                            recommendation={
                              report?.recommendation?.[0] === "true" ||
                              !!report?.recommendation
                            }
                            Skill_Evaluation={report?.report?.Skill_Evaluation}
                            summary={report?.report?.overall_summary}
                            fullReport={report?.report}
                            interviewData={interviewData}
                            rawReportData={report}
                          />
                        </motion.div>
                      </Modal>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
