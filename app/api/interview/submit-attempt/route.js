import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/lib/mongodb/models/User';
import Interview from '@/lib/mongodb/models/Interview';
import InterviewAttempt from '@/lib/mongodb/models/InterviewAttempt';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';

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
    const { status, interview_id, started_at, chat_conversation } = await req.json();
    console.log("status, interview_id, started_at, chat_conversation")
    console.log(status, interview_id, started_at, chat_conversation)
    
    if (!status || !interview_id || !started_at || !chat_conversation) {
      return NextResponse.json({ state: false, error: 'Missing status or interview_id, user_id, started_at', message: 'Failed' }, { status: 400 });
    }

    // Step 3: Verify the user exists in MongoDB "users" collection
    const userRecord = await User.findOne({ clerk_id: userId });

    if (!userRecord) {
      return NextResponse.json({ state: false, error: 'User not found in database', message: "Failed" }, { status: 403 });
    }

    // Step 5: Insert new attempt
    const inserted = new InterviewAttempt({
      user_id: userId,
      interview_id: interview_id,
      started_at: started_at,
      interview_attempt: true,
      status: status,
      chat_conversation: chat_conversation
    });

    const savedAttempt = await inserted.save();

    // update in the interviews table also
    const updatedInterview = await Interview.findByIdAndUpdate(
      interview_id,
      { status: status },
      { new: true }
    );

    if (!updatedInterview) {
      return NextResponse.json({ state: false, error: 'Update failed in interviews table', message: "Failed" }, { status: 500 });
    }

    return NextResponse.json({ state: true, data: savedAttempt, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}
