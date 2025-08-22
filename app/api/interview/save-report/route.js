import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Report from '@/lib/mongodb/models/Report';
import InterviewAttempt from '@/lib/mongodb/models/InterviewAttempt';
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
    
    // Step 1: Get authenticated Clerk user
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ state: false, error: 'Unauthorized', message: "Failed" }, { status: 401 });
    }

    // Step 2: Ensure user exists in MongoDB
    try {
      await ensureUserExists(user);
    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      return NextResponse.json({ state: false, error: 'Failed to initialize user', message: 'Database error' }, { status: 500 });
    }

    // Step 3: Verify the user exists in MongoDB "users" collection
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
      return NextResponse.json({ state: false, error: 'User not found in database', message: "Failed" }, { status: 403 });
    }

    // Step 4: Fetch reports with populated interview attempts and interviews
    const reports = await Report.find()
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

    // Filter out reports where interview_attempt_id population failed (user doesn't match)
    const filteredReports = reports.filter(report => report.interview_attempt_id !== null);

    // Transform data to match expected frontend format
    const transformedReports = filteredReports.map(report => ({
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
      } : null
    }));

    return NextResponse.json({ state: true, data: transformedReports, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}

export async function POST(req) {
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

    if (!userId) {
      return NextResponse.json({ state: false, error: 'Unauthorized', message: "Failed" }, { status: 401 });
    } 
    
    // Step 2: Get form data from request body
    const body = await req.json();
    console.log("Received body:", body);

    // Step 3: Destructure and validate required fields
    const { interviewId, interview_attempt_id, score, recommendation, report, duration } = body;

    console.log(duration)
    
    // Improved validation - check for existence and proper types
    const validationErrors = [];
    
    if (!interviewId || typeof interviewId !== 'string') {
      validationErrors.push('interviewId must be a valid MongoDB ObjectId string');
    }

    if (interview_attempt_id && typeof interview_attempt_id !== 'string') {
      validationErrors.push('interview_attempt_id must be a valid MongoDB ObjectId string if provided');
    }
    
    if (score === undefined || score === null || score === '') {
      validationErrors.push('score is required');
    }
    
    if (recommendation === undefined || recommendation === null) {
      validationErrors.push('recommendation is required');
    }
    
    if (!report || typeof report !== 'object' || Array.isArray(report)) {
      validationErrors.push('report must be a valid object');
    }

    if(!duration){
      validationErrors.push('Error in duration value')
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          state: false, 
          error: 'Validation failed',
          details: {
            validationErrors,
            received: {
              interview_id: interviewId,
              interview_attempt_id: interview_attempt_id,
              score: score,
              recommendation: recommendation,
              report: report
            }
          },
          message: "Failed" 
        }, 
        { status: 400 }
      );
    }

    // Step 4: Ensure user exists in MongoDB
    try {
      await ensureUserExists(user);
    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      return NextResponse.json({ state: false, error: 'Failed to initialize user', message: 'Database error' }, { status: 500 });
    }

    // Step 5: Verify the user exists in MongoDB "users" collection
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
      return NextResponse.json({ state: false, error: 'User not found in database', message: "Failed" }, { status: 403 });
    }

    // Step 6: Create new report
    const reportData = new Report({
      user_id: userId,
      interview_id: interviewId,
      interview_attempt_id: interview_attempt_id || null,
      overall_score: Number(score),
      recommendations: Array.isArray(recommendation) ? recommendation : [recommendation],
      report_data: {
        ...report,
        duration: duration
      }
    });

    console.log("Inserting data:", reportData);

    // Step 7: Save the report
    console.log("Attempting to save report to database...");
    const savedReport = await reportData.save();
    console.log("Report saved successfully:", savedReport._id);

    if (!savedReport) {
      console.error('MongoDB insert error');
      return NextResponse.json(
        { 
          state: false, 
          error: 'Insert failed',
          message: "Failed" 
        }, 
        { status: 500 }
      );
    }

    // Include both _id and id for frontend compatibility
    const responseData = {
      ...savedReport.toObject(),
      id: savedReport._id.toString()
    };

    return NextResponse.json({ state: true, data: responseData, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { 
        state: false, 
        error: 'Internal Server Error',
        details: err.message,
        message: "Failed" 
      }, 
      { status: 500 }
    );
  }
}
