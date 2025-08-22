import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Report from '@/lib/mongodb/models/Report';
import InterviewAttempt from '@/lib/mongodb/models/InterviewAttempt';
import Interview from '@/lib/mongodb/models/Interview';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { ensureUserExists } from '@/lib/utils/ensureUser';


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

    // Step 4: Fetch all reports with populated interview attempts and interviews
    const reports = await Report.find()
      .populate({
        path: 'interview_attempt_id',
        model: 'InterviewAttempt',
        match: { user_id: userId },
        populate: {
          path: 'interview_id',
          model: 'Interview'
        }
      })
      .populate({
        path: 'interview_id',
        model: 'Interview'
      })
      .sort({ createdAt: -1 });

    // Filter out reports where interview_attempt_id population failed (user doesn't match)
    const filteredReports = reports.filter(report => report.interview_attempt_id !== null);

    console.log("========== Reports ===========", filteredReports);

    return NextResponse.json({ state: true, data: filteredReports, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}