import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Report from '@/lib/mongodb/models/Report';
import InterviewAttempt from '@/lib/mongodb/models/InterviewAttempt';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';


export async function GET(req, context) {
  try {
    await dbConnect();
    
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    // Step 1: Get authenticated Clerk user
    const user = await currentUser();
    const userId = user?.id;

    // Get reportId from params
    const param = await context.params;
    const reportId = param.id;

    console.log(reportId)

    if (!userId) {
      return NextResponse.json({ state: false, error: 'Unauthorized', message: "Failed" }, { status: 401 });
    }

    // Step 3: Verify the user exists in MongoDB "users" collection
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
      return NextResponse.json({ state: false, error: 'User not found in database', message: "Failed" }, { status: 403 });
    }

    // Step 5: Fetch report with populated interview data (handle null interview_attempt_id)
    const report = await Report.findById(reportId)
      .populate({
        path: 'interview_attempt_id',
        populate: {
          path: 'interview_id',
          model: 'Interview'
        }
      })
      .populate({
        path: 'interview_id',
        model: 'Interview'
      });

    console.log("📊 Found report:", !!report);
    console.log("📊 Report user_id:", report?.user_id);
    console.log("📊 Report interview_attempt_id:", report?.interview_attempt_id);
    console.log("📊 Report interview_id:", report?.interview_id);

    if (!report) {
      return NextResponse.json({ state: false, error: 'Report not found', message: "Failed" }, { status: 404 });
    }

    // Verify the report belongs to the current user
    if (report.user_id !== userId) {
      return NextResponse.json({ state: false, error: 'Unauthorized access to report', message: "Failed" }, { status: 403 });
    }

    // Transform the data to match the expected frontend format
    const transformedReport = {
      ...report.toObject(),
      id: report._id.toString(),
      interview_attempts: report.interview_attempt_id ? {
        id: report.interview_attempt_id._id.toString(),
        started_at: report.interview_attempt_id.started_at,
        completed_at: report.interview_attempt_id.updatedAt,
        status: report.interview_attempt_id.status,
        interview_attempt: report.interview_attempt_id.interview_attempt,
        chat_conversation: report.interview_attempt_id.chat_conversation,
        interviews: report.interview_attempt_id.interview_id ? {
          id: report.interview_attempt_id.interview_id._id.toString(),
          interview_name: report.interview_attempt_id.interview_id.interview_name,
          company: report.interview_attempt_id.interview_id.company,
          company_logo: report.interview_attempt_id.interview_id.company_logo,
          position: report.interview_attempt_id.interview_id.position,
          interview_time: report.interview_attempt_id.interview_id.interview_time,
          duration: report.interview_attempt_id.interview_id.duration,
          status: report.interview_attempt_id.interview_id.status
        } : null
      } : {
        // Handle reports with null interview_attempt_id
        id: null,
        started_at: null,
        completed_at: null,
        status: 'incomplete',
        interview_attempt: null,
        chat_conversation: null,
        interviews: report.interview_id ? {
          id: report.interview_id._id.toString(),
          interview_name: report.interview_id.interview_name,
          company: report.interview_id.company,
          company_logo: report.interview_id.company_logo,
          position: report.interview_id.position,
          interview_time: report.interview_id.interview_time,
          duration: report.interview_id.duration,
          status: report.interview_id.status
        } : null
      }
    };

    return NextResponse.json({ state: true, data: transformedReport, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}