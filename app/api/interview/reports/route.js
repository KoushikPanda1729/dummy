import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import InterviewAttempt from '@/lib/mongodb/models/InterviewAttempt';
import Report from '@/lib/mongodb/models/Report';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { ensureUserExists } from '@/lib/utils/ensureUser';

export async function GET(req) {
  try {
    await dbConnect();
    
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';

    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const user = await currentUser();
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ state: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in MongoDB
    try {
      await ensureUserExists(user);
    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      return NextResponse.json({ state: false, error: 'Failed to initialize user' }, { status: 500 });
    }

    // First, check if there are any reports for this user at all
    const basicReports = await Report.find({ user_id: userId });
    console.log("🔍 Basic reports for user", userId, ":", basicReports.length);
    
    if (basicReports.length > 0) {
      console.log("📋 Basic report IDs:", basicReports.map(r => r._id));
      console.log("📋 Interview attempt IDs:", basicReports.map(r => r.interview_attempt_id));
    }

    // First get reports directly for this user (including those with null interview_attempt_id)
    console.log("🔍 Fetching reports for user:", userId);
    const userReports = await Report.find({ user_id: userId })
      .populate({
        path: 'interview_id',
        model: 'Interview'
      })
      .populate({
        path: 'interview_attempt_id',
        model: 'InterviewAttempt'
      })
      .sort({ createdAt: -1 });

    console.log("📊 Direct user reports found:", userReports.length);
    if (userReports.length > 0) {
      console.log("📊 First report interview_id populated:", !!userReports[0].interview_id);
      console.log("📊 First report interview questions:", userReports[0].interview_id?.questions?.length);
      console.log("📊 First report college_interview:", !!userReports[0].interview_id?.college_interview);
    }

    // Also fetch reports with populated interview attempts for complete data
    const reportsWithAttempts = await Report.find()
      .populate({
        path: 'interview_attempt_id',
        model: 'InterviewAttempt',
        match: { user_id: userId },
        populate: {
          path: 'interview_id',
          model: 'Interview',
          select: 'interview_name interview_time company company_logo status duration position location interview_style job_description interview_link expiry_date interview_type createdAt'
        }
      })
      .populate({
        path: 'interview_id',
        model: 'Interview'
      })
      .sort({ createdAt: -1 });

    // Combine both sets of reports, prioritizing direct user reports
    const allUserReports = [...userReports];
    
    // Add any additional reports from the attempt-based query that aren't already included
    reportsWithAttempts.forEach(report => {
      if (report.interview_attempt_id && !allUserReports.find(r => r._id.toString() === report._id.toString())) {
        allUserReports.push(report);
      }
    });

    const reports = allUserReports;

    console.log("📊 Raw reports found:", reports.length);
    console.log("📊 Reports data:", reports.map(r => ({ 
      id: r._id, 
      user_id: r.user_id, 
      interview_attempt_id: r.interview_attempt_id,
      hasAttempt: !!r.interview_attempt_id
    })));

    // Don't filter out reports with null interview_attempt_id - we want to include them
    const filteredReports = reports; // Keep all user reports

    console.log("🔍 Final reports to return:", filteredReports.length);
    console.log("🔍 Report details:", filteredReports.map(r => ({ 
      id: r._id, 
      user_id: r.user_id, 
      interview_attempt_id: r.interview_attempt_id ? r.interview_attempt_id._id : 'null',
      interview_id: r.interview_id ? r.interview_id._id : 'null',
      score: r.overall_score
    })));

    if (filteredReports.length === 0) {
      console.log("❌ No reports found");
      return NextResponse.json({ state: true, data: [], message: 'No reports found' });
    }

    // Transform data to match expected frontend format
    const enrichedReports = filteredReports.map(report => ({
      id: report._id.toString(),
      recommendation: report.recommendations || [],
      score: report.overall_score || 0,
      report: report.report_data || {},
      created_at: report.createdAt,
      interview_attempts: report.interview_attempt_id ? {
        id: report.interview_attempt_id._id.toString(),
        started_at: report.interview_attempt_id.started_at,
        completed_at: report.interview_attempt_id.updatedAt,
        status: report.interview_attempt_id.status,
        interview_attempt: report.interview_attempt_id.interview_attempt,
        interview_id: report.interview_attempt_id.interview_id,
        user_id: report.interview_attempt_id.user_id,
        interviews: report.interview_attempt_id.interview_id ? {
          id: report.interview_attempt_id.interview_id._id.toString(),
          interview_name: report.interview_attempt_id.interview_id.interview_name,
          interview_time: report.interview_attempt_id.interview_id.interview_time,
          company: report.interview_attempt_id.interview_id.company,
          company_logo: report.interview_attempt_id.interview_id.company_logo,
          status: report.interview_attempt_id.interview_id.status,
          duration: report.interview_attempt_id.interview_id.duration,
          position: report.interview_attempt_id.interview_id.position,
          location: report.interview_attempt_id.interview_id.location,
          interview_style: report.interview_attempt_id.interview_id.interview_style,
          job_description: report.interview_attempt_id.interview_id.job_description,
          interview_link: report.interview_attempt_id.interview_id.interview_link,
          expiry_date: report.interview_attempt_id.interview_id.expiry_date,
          interview_type: report.interview_attempt_id.interview_id.interview_type,
          created_date: report.interview_attempt_id.interview_id.createdAt
        } : null
      } : {
        // Handle reports with null interview_attempt_id
        id: null,
        started_at: null,
        completed_at: null,
        status: 'incomplete',
        interview_attempt: null,
        interview_id: report.interview_id,
        user_id: report.user_id,
        interviews: report.interview_id ? {
          id: report.interview_id._id.toString(),
          interview_name: report.interview_id.interview_name,
          interview_time: report.interview_id.interview_time,
          company: report.interview_id.company,
          company_logo: report.interview_id.company_logo,
          status: report.interview_id.status,
          duration: report.interview_id.duration,
          position: report.interview_id.position,
          location: report.interview_id.location,
          interview_style: report.interview_id.interview_style,
          job_description: report.interview_id.job_description,
          interview_link: report.interview_id.interview_link,
          expiry_date: report.interview_id.expiry_date,
          interview_type: report.interview_id.interview_type,
          created_date: report.interview_id.createdAt,
          // Add the complete interview data including questions and resume
          questions: report.interview_id.questions,
          college_interview: report.interview_id.college_interview,
          type: report.interview_id.type,
          difficulty_level: report.interview_id.difficulty_level,
          experience: report.interview_id.experience
        } : null,
        // Also add interview_id field with complete data for backward compatibility
        interview_id: report.interview_id ? {
          ...report.interview_id.toObject(),
          id: report.interview_id._id.toString()
        } : null
      }
    }));

    return NextResponse.json({ state: true, data: enrichedReports, message: 'Success' }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
