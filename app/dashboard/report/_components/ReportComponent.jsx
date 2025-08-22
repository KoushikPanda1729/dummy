"use client";

import fetchReportDetails from "@/app/service/interview/fetchReportDetails";
import Tabs from "@/components/Tabs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, FileText, Clock, TrendingUp, User, Building2, Calendar, Award, Target } from "lucide-react";

export default function ReportComponent({ id }) {
  const [reportDetails, setReportDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getReport() {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchReportDetails(id);
        
        if (!result?.state) {
          setError(result?.error || "Failed to fetch report details");
          toast.error("Error in fetching report card");
          return;
        }
        
        setReportDetails(result?.data);
        console.log("🔍 Report Details Structure:", result?.data);
        console.log("🔍 Available fields:", Object.keys(result?.data || {}));
        toast.success("Report loaded successfully");
      } catch (err) {
        setError(err.message || "Something went wrong");
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      getReport();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Report</h3>
          <p className="text-gray-600">Analyzing performance data and generating insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Report</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reportDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h3>
            <p className="text-gray-600">The requested report could not be located in our system.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl shadow-2xl mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12 lg:px-12 lg:py-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6 mb-6 lg:mb-0">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="text-3xl font-bold text-white">
                    {(reportDetails?.company || reportDetails?.interview_name || "I")?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {reportDetails?.interview_name || reportDetails?.title || "Interview Report"}
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    {reportDetails?.company || "Company"} • {reportDetails?.position || "Position"} • {reportDetails?.interview_type || "Interview"}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-5xl lg:text-6xl font-bold text-white mb-2">
                  {reportDetails?.score || reportDetails?.overall_score || 0}
                  <span className="text-2xl text-indigo-200">/100</span>
                </div>
                <div className="text-indigo-200 text-sm">
                  {reportDetails?.final_verdict?.recommendation === "YES" ? "Recommended" : 
                   reportDetails?.final_verdict?.recommendation === "NO" ? "Not Recommended" : 
                   "Overall Score"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Candidate</div>
                <div className="font-semibold text-gray-900">
                  {reportDetails?.candidate_name || 
                   reportDetails?.user_name || 
                   reportDetails?.name || 
                   "Anonymous"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Company</div>
                <div className="font-semibold text-gray-900">
                  {reportDetails?.company || 
                   reportDetails?.organization || 
                   "Not Specified"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Position</div>
                <div className="font-semibold text-gray-900">
                  {reportDetails?.position || 
                   reportDetails?.role || 
                   reportDetails?.job_title || 
                   "Not Specified"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Interview Date</div>
                <div className="font-semibold text-gray-900">
                  {reportDetails?.interview_date ? 
                   new Date(reportDetails.interview_date).toLocaleDateString() :
                   reportDetails?.created_at ? 
                   new Date(reportDetails.created_at).toLocaleDateString() :
                   new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Report Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Detailed Analysis</h2>
            </div>
          </div>
          
          <div className="p-0">
            <Tabs reportDetails={reportDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
