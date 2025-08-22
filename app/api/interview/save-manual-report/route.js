import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import Report from '@/lib/mongodb/models/Report';
import InterviewAttempt from '@/lib/mongodb/models/InterviewAttempt';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { ensureUserExists } from '@/lib/utils/ensureUser';
import { parseGeneratedReport } from '@/lib/utils/helper';

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
    console.log("📥 Received manual report data:", body);

    // Step 3: Parse the required fields
    const { reportData, interviewId, interview_attempt_id } = body;

    if (!reportData) {
      return NextResponse.json({ 
        state: false, 
        error: 'reportData is required',
        message: "Failed" 
      }, { status: 400 });
    }

    // Step 4: Ensure user exists in MongoDB
    try {
      await ensureUserExists(user);
    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      return NextResponse.json({ state: false, error: 'Failed to initialize user', message: 'Database error' }, { status: 500 });
    }

    // Step 5: Parse the report data
    let parsedReport;
    try {
      parsedReport = parseGeneratedReport(reportData);
      console.log("✅ Parsed report successfully:", !!parsedReport);
    } catch (parseError) {
      console.error("❌ Failed to parse report:", parseError);
      return NextResponse.json({ 
        state: false, 
        error: 'Failed to parse report data',
        message: "Failed" 
      }, { status: 400 });
    }

    if (!parsedReport) {
      return NextResponse.json({ 
        state: false, 
        error: 'Could not parse report data',
        message: "Failed" 
      }, { status: 400 });
    }

    // Step 6: Extract score and recommendation
    const score = parsedReport.final_verdict?.score || 0;
    const recommendation = parsedReport.final_verdict?.recommendation || 'NO';

    console.log("📊 Extracted data:", { score, recommendation, userId, interviewId, interview_attempt_id });

    // Step 7: Create new report (with or without interview attempt ID)
    const reportDataToSave = new Report({
      user_id: userId,
      interview_id: interviewId || null,
      interview_attempt_id: interview_attempt_id || null,
      overall_score: Number(score),
      recommendations: Array.isArray(recommendation) ? recommendation : [recommendation],
      report_data: parsedReport
    });

    console.log("💾 Attempting to save report to database...");
    const savedReport = await reportDataToSave.save();
    console.log("✅ Report saved successfully with ID:", savedReport._id);

    if (!savedReport) {
      console.error('❌ MongoDB insert error');
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

    return NextResponse.json({ 
      state: true, 
      data: responseData, 
      message: "Report saved successfully" 
    }, { status: 200 });

  } catch (err) {
    console.error('❌ Unexpected error:', err);
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